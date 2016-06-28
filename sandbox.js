require('./dotstar.js');
// require('./portlist.js').list().then(ports => console.log(ports));
// require('./desk-lights.js');

// const Leap = require('leapjs');

// // Setup Leap loop with frame callback function
// var controllerOptions = {enableGestures: true};
//
// Leap.loop(controllerOptions, function(frame) {
//     console.log(frame);
//   // Body of callback function
// })

//
// const WebSocketClient = require('websocket').client;
// const client = new WebSocketClient();
//
// client.connect('ws://127.0.0.1:6437');//, null, null, null, requestOptions);
// //
// var WebSocket = require('ws');
// var ws = new WebSocket('ws://127.0.0.1:6437');
//
// ws.on('open', function open() {
//   console.log('connection open!');
// });
//
// ws.on('message', function(raw, flags) {
//     const data = JSON.parse(raw);
//     if(data.hands && data.hands.length > 0) {
//         // console.log('incoming data: ', data.hands);
//         console.log(Object.keys(data));
//
//     }
//   // flags.binary will be set if a binary data is received.
//   // flags.masked will be set if the data was masked.
// });
