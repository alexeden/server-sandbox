// import { Dotstar, Colors, APA102C } from 'dotstar-node';
// import * as OS from 'os';
// import chalk from 'chalk';
import * as http from 'http';
import * as fs from 'fs';
import * as net from 'net';
import * as https from 'https';
import * as path from 'path';
import * as websockets from 'ws';
import * as express from 'express';

const httpsServerOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const app = express();

app.all('*', () => {
  console.log('gotta get request!');
  return {
    message: 'hi!',
  };
});

const httpsServer = https.createServer(httpsServerOptions, app);
const wssServer = new websockets.Server({ noServer: true });

wssServer.on('connection', socket => {
  console.log('got a connection!');
});

httpsServer.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  // const pathname = url.parse(request.url!).pathname;
  wssServer.handleUpgrade(request, socket, head, clientSocket => {
    wssServer.emit('connection', clientSocket, request);
  });
});


httpsServer.listen(4000, '0.0.0.0', () => console.log('listening on port 4000'));


// export const videoWsServer = new ws.Server({ noServer: true });
// export const rcWsServer = new ws.Server({ noServer: true });
// export const stateWsServer = new ws.Server({ noServer: true });

// httpsServer.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
//   const pathname = url.parse(request.url!).pathname;
//   let wssServer: ws.Server;

//   switch (pathname) {
//     case '/video':  wssServer = videoWsServer; break;
//     case '/rc':     wssServer = rcWsServer; break;
//     case '/state':  wssServer = stateWsServer; break;
//     default: socket.destroy(); return;
//   }

//   wssServer.handleUpgrade(request, socket, head, clientSocket => {
//     wssServer.emit('connection', clientSocket, request);
//   });
// });


// (async () => {
// try {
//     const dotstar = await Dotstar.create({
//       devicePath: OS.type() !== 'Linux' ? '/dev/null' : undefined,
//       clockSpeed: APA102C.CLK_MAX,
//     });


//     const colors = Object.values(Colors).filter(c => typeof c === 'number');
//     const testInterval = setInterval(
//       () => {
//         // dotstar.apply((c, i) => colors[Math.floor(Math.random() * colors.length)]);
//         dotstar.apply((c, i) => colors[i % colors.length]);
//         dotstar.sync();
//       },
//       1000
//     );

//     setTimeout(
//       () => {
//         clearInterval(testInterval);
//         dotstar.shutdown();
//         console.log(chalk.green('done! everything should be off'));
//       },
//       5000
//     );
//   }
//   catch (error) {
//     console.error(error);
//   }

// })();
