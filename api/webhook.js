export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = 'https://api.base44.app/api/apps/699fa4defc377858f5f117c0/functions/callEventHandler';

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ error: 'Proxy failed', detail: error.message });
  }
}
