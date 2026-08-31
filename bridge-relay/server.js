/**
 * SATARK AI — Bridge Relay Server
 * Runs on port 3001. Acts as a real-time relay between the Citizen Portal
 * (localhost:3000) and the Admin Portal (localhost:5173).
 *
 * Endpoints:
 *   POST /notify  — Citizen portal sends new complaint data here
 *   GET  /events  — Admin portal subscribes via Server-Sent Events (SSE)
 */

const http = require('http');

let sseClients = [];

const server = http.createServer((req, res) => {
    // ── CORS: allow all localhost origins ──
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // ── SSE stream: admin portal connects here and listens ──
    if (req.url === '/events' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type':  'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection':    'keep-alive',
        });
        // Send a heartbeat immediately so the client knows connection is live
        res.write('data: {"type":"connected"}\n\n');

        sseClients.push(res);
        console.log(`[Bridge] Admin client connected. Total: ${sseClients.length}`);

        // Clean up when admin tab closes
        req.on('close', () => {
            sseClients = sseClients.filter(c => c !== res);
            console.log(`[Bridge] Admin client disconnected. Total: ${sseClients.length}`);
        });
        return;
    }

    // ── POST /notify: citizen portal sends full complaint + notification ──
    if (req.url === '/notify' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const eventStr = JSON.stringify(data);

                // Push to every connected admin SSE client
                sseClients.forEach(client => {
                    client.write(`data: ${eventStr}\n\n`);
                });

                console.log(`[Bridge] Relayed complaint ${data.complaint?.id || '?'} to ${sseClients.length} admin client(s).`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, clients: sseClients.length }));
            } catch (e) {
                console.error('[Bridge] Bad payload:', e.message);
                res.writeHead(400);
                res.end('Bad Request');
            }
        });
        return;
    }

    // ── Health check ──
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, clients: sseClients.length }));
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`\n[SATARK Bridge Relay] Running at http://localhost:${PORT}`);
    console.log(`  POST http://localhost:${PORT}/notify  — Citizen portal sends complaints`);
    console.log(`  GET  http://localhost:${PORT}/events  — Admin portal subscribes (SSE)\n`);
});
