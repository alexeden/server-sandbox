import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
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

wss.on('connection', socket => {
  if (wss.clients.size === 1) {
    console.log('got first socket connection!');
    dotstar = Dotstar.create({
      devicePath: '/dev/null',
    });

    console.log(dotstar && dotstar.printBuffer());
  }
  liveClients.add(socket);

  socket.on('pong', liveClients.add.bind(liveClients, socket));

  socket.on('close', async (code, reason) => {
    console.log(`Socket was closed with code ${code} and reason: `, reason);
    if (wss.clients.size < 1) {
      dotstar && dotstar.setAll(0);
      dotstar = null;
      console.log('no clients left');
    }
  });
});

setInterval(
  () => wss.clients.forEach(socket => {
    if (!liveClients.has(socket)) socket.terminate();
    liveClients.delete(socket);
    socket.ping(() => {});
  }),
  5000
);
