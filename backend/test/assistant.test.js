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

function openAiStream(chunks) {
  const body = [
    ...chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`),
    'data: [DONE]\n\n',
  ].join('');
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
}

function tokenChunk(text) {
  return { choices: [{ delta: { content: text } }] };
}

function toolChunk(criteria) {
  return {
    choices: [{
      delta: {
        tool_calls: [{
          index: 0,
          id: 'call_search',
          type: 'function',
          function: {
            name: 'search_flights',
            arguments: JSON.stringify(criteria),
          },
        }],
      },
    }],
  };
}

test('reports missing provider configuration before opening a stream', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 503);
    assert.match(JSON.parse(response.body).error, /OPENAI_API_KEY/);
  } finally {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});

test('streams assistant tokens as server-sent events', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = global.fetch;
  process.env.OPENAI_API_KEY = 'test-key';
  let providerRequest;
  global.fetch = async (_url, options) => {
    providerRequest = JSON.parse(options.body);
    return openAiStream([tokenChunk('Hello'), tokenChunk(' traveler!')]);
  };

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 200);
    assert.match(response.headers['content-type'], /text\/event-stream/);
    assert.equal(providerRequest.stream, true);
    assert.match(response.body, /event: token\ndata: \{"text":"Hello"\}/);
    assert.match(response.body, /event: token\ndata: \{"text":" traveler!"\}/);
    assert.match(response.body, /event: done\ndata: \{"search":null\}/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});

test('explains when OpenAI rejects requests because the project has no quota', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = global.fetch;
  process.env.OPENAI_API_KEY = 'test-key';
  global.fetch = async () => new Response(JSON.stringify({
    error: { code: 'insufficient_quota', type: 'insufficient_quota' },
  }), { status: 429, headers: { 'Content-Type': 'application/json' } });

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 200);
    assert.match(response.body, /event: error/);
    assert.match(response.body, /no available quota/);
    assert.match(response.body, /billing, credits, and usage limits/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});

test('suggests waiting when OpenAI returns a temporary rate limit', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = global.fetch;
  process.env.OPENAI_API_KEY = 'test-key';
  global.fetch = async () => new Response(JSON.stringify({
    error: { code: 'rate_limit_exceeded', type: 'rate_limit_error' },
  }), { status: 429, headers: { 'Content-Type': 'application/json' } });

  try {
    const response = await postChat([{ role: 'user', content: 'Hello' }]);
    assert.equal(response.status, 200);
    assert.match(response.body, /event: error/);
    assert.match(response.body, /rate limit was reached/);
    assert.match(response.body, /Wait a minute and try again/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});

test('searches inventory before streaming route recommendations', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = global.fetch;
  const originalFind = Flight.find;
  process.env.OPENAI_API_KEY = 'test-key';
  let providerCalls = 0;
  let flightFilter;
  let flightSort;
  global.fetch = async (_url, options) => {
    providerCalls += 1;
    const request = JSON.parse(options.body);
    if (providerCalls === 1) {
      assert.equal(request.stream, true);
      return openAiStream([toolChunk({
        departure: 'Delhi',
        arrival: 'Mumbai',
        max_price: 2500,
      })]);
    }

    assert.equal(request.messages.at(-1).role, 'tool');
    assert.match(request.messages.at(-1).content, /XG101/);
    return openAiStream([tokenChunk('AirX is available for ₹2,200.')]);
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
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});
