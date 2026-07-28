// Dev-only CORS proxy → forwards to the live Railway backend with permissive
// CORS so the Expo *web* preview can load real data. Native builds need no proxy.
//   node cors-proxy.js   then   EXPO_PUBLIC_API_URL="http://localhost:8790/api/v1" npx expo start --web
const http = require('http');
const https = require('https');

const TARGET = 'ems-v0-backend-production.up.railway.app';
const PORT = 8790;

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    const opts = { host: TARGET, path: req.url, method: req.method, headers: { ...req.headers, host: TARGET } };
    const proxied = https.request(opts, (pr) => {
      res.writeHead(pr.statusCode || 502, { ...pr.headers, 'access-control-allow-origin': '*' });
      pr.pipe(res);
    });
    proxied.on('error', (e) => {
      res.writeHead(502);
      res.end(String(e));
    });
    req.pipe(proxied);
  })
  .listen(PORT, () => console.log(`cors-proxy → https://${TARGET} on http://localhost:${PORT}`));
