const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');
const Flight = require('../src/models/Flight');
const assistantRoute = require('../src/routes/assistant');

const app = express();
app.use(express.json());
app.use('/api/assistant', assistantRoute);

let server;
let serverUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  serverUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

function postChat(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ messages });
    const request = http.request(`${serverUrl}/api/assistant/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: responseBody }));
    });
    request.on('error', reject);
    request.end(body);
  });
}

function geminiStream(chunks) {
  const body = [
    ...chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`),
    `data: ${JSON.stringify({ candidates: [{ finishReason: 'STOP' }] })}\n\n`,
  ].join('');
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
}

function tokenChunk(text) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

function toolChunk(criteria) {
  return { candidates: [{ content: { parts: [{
    functionCall: { name: 'search_flights', args: criteria },
  }] } }] };
}

test('reports missing provider configuration before opening a stream', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 503);
    assert.match(JSON.parse(response.body).error, /GEMINI_API_KEY/);
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('streams Gemini response tokens as server-sent events', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'test-key';
  let providerRequest;
  let providerUrl;
  global.fetch = async (url, options) => {
    providerUrl = url;
    assert.equal(options.headers['x-goog-api-key'], 'test-key');
    providerRequest = JSON.parse(options.body);
    return geminiStream([tokenChunk('Hello'), tokenChunk(' traveler!')]);
  };

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 200);
    assert.match(response.headers['content-type'], /text\/event-stream/);
    assert.match(providerUrl, /models\/gemini-2\.5-flash:streamGenerateContent\?alt=sse/);
    assert.equal(providerRequest.systemInstruction.parts[0].text.includes('trip-planning assistant'), true);
    assert.equal(providerRequest.contents[0].role, 'user');
    assert.deepEqual(providerRequest.tools[0].functionDeclarations[0].name, 'search_flights');
    assert.match(response.body, /event: token\ndata: \{"text":"Hello"\}/);
    assert.match(response.body, /event: token\ndata: \{"text":" traveler!"\}/);
    assert.match(response.body, /event: done\ndata: \{"search":null\}/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('explains when Gemini rejects requests because the project has no quota', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'test-key';
  global.fetch = async () => new Response(JSON.stringify({
    error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'You exceeded your current quota. Check billing.' },
  }), { status: 429, headers: { 'Content-Type': 'application/json' } });

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 200);
    assert.match(response.body, /event: error/);
    assert.match(response.body, /no available quota/);
    assert.match(response.body, /Google AI Studio billing/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('suggests waiting when Gemini returns a temporary rate limit', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'test-key';
  global.fetch = async () => new Response(JSON.stringify({
    error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Requests per minute exceeded.' },
  }), { status: 429, headers: { 'Content-Type': 'application/json' } });

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 200);
    assert.match(response.body, /event: error/);
    assert.match(response.body, /Gemini API rate limit was reached/);
    assert.match(response.body, /Wait a minute and try again/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('searches inventory before streaming route recommendations', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  const originalFind = Flight.find;
  process.env.GEMINI_API_KEY = 'test-key';
  let providerCalls = 0;
  let flightFilter;
  let flightSort;
  let followUpRequest;
  global.fetch = async (_url, options) => {
    providerCalls += 1;
    const request = JSON.parse(options.body);
    if (providerCalls === 1) {
      return geminiStream([toolChunk({
        departure: 'Delhi',
        arrival: 'Mumbai',
        max_price: 2500,
      })]);
    }

    followUpRequest = request;
    assert.equal(request.contents.at(-1).role, 'user');
    assert.match(JSON.stringify(request.contents.at(-1).parts), /XG101/);
    return geminiStream([tokenChunk('AirX is available for ₹2,200.')]);
  };
  Flight.find = (filter) => {
    flightFilter = filter;
    return {
      sort(value) {
        flightSort = value;
        return this;
      },
      limit(value) {
        assert.equal(value, 10);
        return this;
      },
      async lean() {
        return [{
          flight_id: 'XG101',
          airline: 'AirX',
          departure_city: 'Delhi',
          arrival_city: 'Mumbai',
          base_price: 2200,
          current_price: 2200,
        }];
      },
    };
  };

  try {
    const response = await postChat([{ role: 'user', content: 'Find flights under ₹2,500 from Delhi to Mumbai' }]);
    assert.equal(response.status, 200);
    assert.match(flightFilter.departure_city.$regex.source, /Delhi/i);
    assert.equal(followUpRequest.contents.at(-2).role, 'model');
    assert.equal(followUpRequest.contents.at(-2).parts[0].functionCall.name, 'search_flights');
    assert.equal(followUpRequest.contents.at(-1).parts[0].functionResponse.name, 'search_flights');
    assert.deepEqual(flightFilter.$or, [
      { current_price: { $lte: 2500 } },
      { current_price: null, base_price: { $lte: 2500 } },
    ]);
    assert.deepEqual(flightSort, { current_price: 1, base_price: 1 });
    assert.match(response.body, /event: token\ndata: \{"text":"AirX is available for ₹2,200\."\}/);
    assert.match(response.body, /event: search\ndata: \{"departure":"Delhi","arrival":"Mumbai"\}/);
    assert.equal(providerCalls, 2);
  } finally {
    global.fetch = originalFetch;
    Flight.find = originalFind;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});
