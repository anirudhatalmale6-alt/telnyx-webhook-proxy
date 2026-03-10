exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const targetUrl = 'https://api.base44.app/api/apps/699fa4defc377858f5f117c0/functions/callEventHandler';

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body,
    });

    const data = await response.text();
    return { statusCode: response.status, body: data };
  } catch (error) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Proxy failed', detail: error.message }) };
  }
};
