import { always, zip, range, compose, add, multiply, map, flatten } from 'ramda';
import { TimeKeeper } from './util';
import { settings } from './config-loader';
import * as SPI from 'pi-spi';
const { SPI_PORT, FPS} = settings;

const START_FRAME_BYTE = 0x00;
const END_FRAME_BYTE = 0xFF;

// Number of bytes needed for a complete update signal
const N = 144;
const FRAME_SIZE = 4;
const END_FRAME_REPS = 1; // Math.ceil(N/2);
const END_FRAME_OFFSET = FRAME_SIZE * (N + 1);
const BUFFER_LENGTH = FRAME_SIZE * (N + 2);
// The raw binary buffer and terminal frames
// const binaryBuffer = new ArrayBuffer(BUFFER_LENGTH);
// const startFrame = new Uint8ClampedArray(binaryBuffer, 0, FRAME_SIZE).fill(START_FRAME_BYTE);
// const endFrame = new Uint8ClampedArray(binaryBuffer, END_FRAME_OFFSET, FRAME_SIZE).fill(END_FRAME_BYTE);

//
// const rgb = (i: number): number[] => {
//   switch(i % 3) {
//     case 0:
//       return [0xFF, 0x00, 0x00];
//     case 1:
//       return [0x00, 0xFF, 0x00];
//     case 2:
//       return [0x00, 0x00, 0xFF];
//   };
// };
//
// const ledFrames
//   = range(0, N)
//       .map(n => startFrame.byteLength * (n + 1))
//       .map((byteOffset, n) =>
//         new Uint8ClampedArray(binaryBuffer, byteOffset, FRAME_SIZE)
//           // .set( <Uint8ClampedArray>([0xFF, ...rgb(n)]))
//           // .set([1])
//       )
//       .map((frame, n) => {
//         frame[0] = 0xFF;
//         rgb(n).map((c, i) => frame[i + 1] = c);
//
//         console.log(frame.byteLength, frame.byteOffset, frame);
//         return frame;
//       });
      //

// const buffer = new Buffer(binaryBuffer);
const spi = SPI.initialize(SPI_PORT);
spi.clockSpeed(800000);
console.log('clock speed: ', spi.clockSpeed());

const buf =
  flatten(
    [ ...range(0, 4).map(_ => START_FRAME_BYTE)
    , ...range(0, N).map(_ => [0xFF, 0xFF, 0x00, 0xFF])
    , ...range(0, 4).map(_ => [0xFF, 0xFF, 0xFF, 0xFF])
    ]
  );

console.log(buf);

const buffer = Buffer.from(buf);

export const write = () => spi.write(buffer, (error, data) => error ? console.error('error: ', error) : write());
    // spi.write(new Buffer(binaryBuffer), (error, data) => error ? console.error(error) : write());

// const Osci = require('./oscillator.js');
// // const clamp = compose(min(CHANNEL_MAX), max(CHANNEL_MIN), parseInt);
// // const OsciRandomInits = () => ({ z: 255*Math.random(), v: (10000*Math.random())-5000 });
//
// // The master time keeper
// const timeKeeper = TimeKeeper(FPS);
//
//
// // Create an array of offsets values in bytes of each led frame in the buffer
// const ledFrameOffsets
//   = compose(
//       map(add(FRAME_SIZE)),
//       map(multiply(FRAME_SIZE)),
//       range(0)
//     );
//
//
// // Create the oscillators (but do not start them), one for each led
// const oscis = range(0, N).map(n => Osci(n, timeKeeper));
// const offsets = ledFrameOffsets(N);
// const ledFrames
//   = zip(oscis, offsets)
//       .map(([osci, offset]) => {
//         const led = new Uint8ClampedArray(binaryBuffer, offset, FRAME_SIZE);
//         led[0] = 0xFF;
//         led[2] = 0xFF;
//         led[3] = 0x00;
//         led[1] = 0x00;
//         // const OsciChannelObserver = ({x, i, z, v, a, idle}) => {
//         //   // led[i + 1] = clamp(z);
//         //   led[i + 1] = 0x00;
//         //   // led[i + 1] = 0xFF;
//         // }
//         // Fire em up
//         // osci(times(() => [OsciRandomInits(), OsciChannelObserver], CHANNELS));
//         return led;
//       });
//
// const spi = SPI.initialize(SPI_PORT);
//
// function write() {
//   spi.write(new Buffer(buffer), () => { /* no-op */ });
// }
// console.log(`ledFrames: `, ledFrames);
// setInterval(write, 1);
//
// export const m = {};
