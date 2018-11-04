import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import * as websockets from 'ws';

const httpsServerOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const server = https.createServer(httpsServerOptions);
const wsServer = new websockets.Server({ noServer: true });

wsServer.on('connection', socket => {
  console.log('got a connection!');
});

server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  wsServer.handleUpgrade(request, socket, head, clientSocket => {
    wsServer.emit('connection', clientSocket, request);
  });
});

server.listen(4000, '0.0.0.0', () => console.log('listening on port 4000'));
