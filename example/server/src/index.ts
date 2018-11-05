import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as qs from 'querystring';
import * as url from 'url';
import * as net from 'net';
import * as websockets from 'ws';
import { Dotstar } from 'dotstar-node';

const server = https.createServer({
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
})
.listen(4000, '0.0.0.0', () => console.log('listening on port 4000'));

const wss = new websockets.Server({ noServer: true });

server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  wss.handleUpgrade(request, socket, head, clientSocket => wss.emit('connection', clientSocket, request));
});

const liveClients = new Set<websockets>([]);
let dotstar: Dotstar | null = null;

wss.on('connection', (socket, req) => {
  // Extract the device config from URL query params
  const parsed = url.parse(req.url || '');
  // Parse the config values into numbers where necessary
  const config = Object.entries(qs.parse(parsed.query || '')).reduce(
    (accum, [k, v]: [string, any]) => ({
      ...accum,
      [k]: Number.isSafeInteger(parseInt(v, 10)) ? parseInt(v, 10) : v,
    }),
    {}
  );

  if (wss.clients.size === 1) {
    dotstar = Dotstar.create(config);
    console.log(dotstar && dotstar.printBuffer());
  }
  liveClients.add(socket);

  socket.on('pong', liveClients.add.bind(liveClients, socket));

  socket.on('message', (data: string = '{}') => {
    if (typeof data === 'string' && data.length > 0 && data !== 'undefined') {
      const { buffer }: { buffer: number[] } = JSON.parse(JSON.parse(data));
      if (dotstar) {
        // console.log(buffer);
        buffer.map((v, i) => dotstar && dotstar.set(v, i));
        // dotstar.sync();
      }
    }
  });

  socket.on('close', async (code, reason) => {
    console.log(`Socket was closed with code ${code} and reason: `, reason);
    if (wss.clients.size < 1) {
      dotstar && dotstar.setAll(0);
      dotstar = null;
    }
  });
});

setInterval(
  () => wss.clients.forEach(socket => {
    if (!liveClients.has(socket)) socket.terminate();
    liveClients.delete(socket);
    socket.ping(() => {});
    if (dotstar) {
      console.log(dotstar.printBuffer());
    }
  }),
  1000
);
