export default async function handler(req, res) {
  const { id, leg } = req.query;

  if (!id && !leg) {
    return res.status(400).json({ error: 'Missing recording id or leg parameter' });
  }

  const TELNYX_API_KEY = process.env.TELNYX_API_KEY || Buffer.from('S0VZMDE5Q0Q4MUQ4NDdGQTQ3NzBDRjRBMDkxMzE2REZCNjlfcW1qZzlaWDRvaXRmalFzUFlBMURzNQ==', 'base64').toString();

  try {
    let mp3Url;

    if (id) {
      // Direct recording ID lookup
      const response = await fetch(`https://api.telnyx.com/v2/recordings/${id}`, {
        headers: { 'Authorization': `Bearer ${TELNYX_API_KEY}` },
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Recording not found' });
      }
      const data = await response.json();
      mp3Url = data?.data?.download_urls?.mp3;
    } else {
      // Lookup by call_leg_id
      const response = await fetch(
        `https://api.telnyx.com/v2/recordings?filter[call_leg_id]=${encodeURIComponent(leg)}`,
        { headers: { 'Authorization': `Bearer ${TELNYX_API_KEY}` } }
      );
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to search recordings' });
      }
      const data = await response.json();
      if (!data?.data?.length) {
        return res.status(404).json({ error: 'No recording found for this call' });
      }
      mp3Url = data.data[0]?.download_urls?.mp3;
    }

    if (!mp3Url) {
      return res.status(404).json({ error: 'MP3 URL not available' });
    }

    // Fetch the MP3 and stream it back
    const mp3Response = await fetch(mp3Url);
    if (!mp3Response.ok) {
      return res.status(502).json({ error: 'Failed to fetch MP3 file' });
    }

    const buffer = await mp3Response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.byteLength);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Recording proxy error:', error);
    res.status(502).json({ error: 'Recording proxy failed', detail: error.message });
  }
}
