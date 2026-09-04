import axios from 'axios';
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

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
