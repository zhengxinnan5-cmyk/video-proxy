export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing ?url= parameter', { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': context.request.headers.get('User-Agent') || '',
        'Range': context.request.headers.get('Range') || '',
        'Referer': 'https://tccalia.woa.com/',
        'Origin': 'https://tccalia.woa.com',
      },
      redirect: 'follow',
    });

    const body = await response.arrayBuffer();

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
      'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
      'Content-Length': body.byteLength,
    };

    if (context.request.headers.get('Range')) {
      corsHeaders['Content-Range'] = response.headers.get('Content-Range') || `bytes */${body.byteLength}`;
      corsHeaders['Accept-Ranges'] = 'bytes';
    }

    return new Response(body, {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(`Proxy fetch failed: ${err.message}`, { status: 502 });
  }
}
