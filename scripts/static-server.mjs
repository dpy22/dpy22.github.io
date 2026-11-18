import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2', '.pdf':'application/pdf', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
export async function createStaticServer({ directory = 'dist', port = 0 } = {}) {
  const root = path.resolve(directory);
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let file = path.resolve(root, `.${pathname}`);
      if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
      try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); }
      catch { response.statusCode = 404; file = path.join(root, '404.html'); }
      let body = await readFile(file);
      response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      response.setHeader('Cache-Control', pathname.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache');
      if (/\.(?:html|css|js|json|svg|xml|txt)$/.test(file) && request.headers['accept-encoding']?.includes('gzip')) {
        body = gzipSync(body);
        response.setHeader('Content-Encoding', 'gzip');
        response.setHeader('Vary', 'Accept-Encoding');
      }
      response.setHeader('Content-Length', body.length);
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}
