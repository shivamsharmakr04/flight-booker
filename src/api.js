import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API = axios.create({ baseURL: API_BASE_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export async function registerUser(name, email, password) {
  const res = await API.post('/auth/register', { name, email, password });
  return res.data;
}

export async function searchFlights(params) {
  const res = await API.get('/flights/search', { params });
  return res.data.flights;
}

export async function streamTripAssistant(messages, { signal, onToken, onSearch }) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/assistant/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    let errorMessage = 'The trip assistant could not respond right now. Please try again shortly.';
    try {
      const body = await response.json();
      if (typeof body.error === 'string') errorMessage = body.error;
    } catch {
      // Keep the user-facing fallback when the server response is not JSON.
    }
    throw new Error(errorMessage);
  }
  if (!response.body) throw new Error('The trip assistant returned no response stream.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed = false;
  let search = null;

  function processEvent(eventText) {
    let eventName = 'message';
    const dataLines = [];
    for (const line of eventText.split(/\r?\n/)) {
      if (line.startsWith('event:')) eventName = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
    }
    if (!dataLines.length) return;

    const data = JSON.parse(dataLines.join('\n'));
    if (eventName === 'token' && typeof data.text === 'string') onToken(data.text);
    if (eventName === 'search' && data.departure && data.arrival) {
      search = { departure: data.departure, arrival: data.arrival };
      onSearch?.(search);
    }
    if (eventName === 'error') throw new Error(data.error || 'The trip assistant stream failed.');
    if (eventName === 'done') {
      completed = true;
      search = data.search || search;
    }
  }

  try {
    while (!completed) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.search(/\r?\n\r?\n/);
      while (boundary !== -1) {
        const eventText = buffer.slice(0, boundary);
        const separator = buffer.slice(boundary).match(/^\r?\n\r?\n/)[0];
        buffer = buffer.slice(boundary + separator.length);
        processEvent(eventText);
        if (completed) break;
        boundary = buffer.search(/\r?\n\r?\n/);
      }
    }

    buffer += decoder.decode();
    if (!completed && buffer.trim()) processEvent(buffer);
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }

  if (!completed) throw new Error('The trip assistant connection ended unexpectedly. Please try again.');
  return { search };
}

export async function bookFlight(data) {
  const res = await API.post('/bookings/book', data);
  return res.data;
}

export async function addWalletBalance(amount) {
  const res = await API.post('/bookings/wallet/add', { amount });
  return res.data;
}

export async function getHistory() {
  const res = await API.get('/bookings/history');
  return res.data;
}

export async function getUser(userId) {
  const res = await API.get(`/auth/user/${userId}`);
  return res.data;
}

export async function loginUser(email, password) {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
}
