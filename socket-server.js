const server = require('http').createServer();
const express = require('express');

const { SOCKET_SERVER } = require('./config-loader.js');

const app = express();

app.use((req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  console.log(`app got HTTP request`);
  res.send(require('./config-loader.js'));
});

const WebSocketServer = require('ws').Server;
const socketServer = new WebSocketServer({ server });

socketServer.on('connection', ws => {
  console.log('connection!');
  ws.send('connected');
});

server.on('request', app);
server.listen(SOCKET_SERVER.PORT, () => {
  console.log(`Listening on ${server.address().port}`);
});





module.exports = socketServer;

// //
// socketServer.on('message', function(raw, flags) {
//   const data = JSON.parse(raw);
//   if(data.hands && data.hands.length > 0) {
//     // console.log('incoming data: ', data.hands);
//     console.log(Object.keys(data));
//
//   }
//   // flags.binary will be set if a binary data is received.
//   // flags.masked will be set if the data was masked.
// });
