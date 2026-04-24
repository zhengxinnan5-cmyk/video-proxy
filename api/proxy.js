export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return res.status(400).send('Missing ?url= parameter');
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
        'Range': req.headers['range'] || '',
        'Referer': 'https://tccalia.woa.com/',
        'Origin': 'https://tccalia.woa.com',
      },
      redirect: 'follow',
    });

    const body = await response.arrayBuffer();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4');
    res.setHeader('Content-Length', body.byteLength);

    if (req.headers['range']) {
      res.setHeader('Content-Range', response.headers.get('content-range') || `bytes */${body.byteLength}`);
      res.setHeader('Accept-Ranges', 'bytes');
    }

    res.status(response.status).send(Buffer.from(body));
  } catch (err) {
    res.status(502).send(`Proxy fetch failed: ${err.message}`);
  }
}
