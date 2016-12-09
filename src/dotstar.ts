import { always, zip, range, compose, add, multiply, map } from 'ramda';
import { TimeKeeper } from './util';
import { settings } from './config-loader';
import * as SPI from 'pi-spi';
const { SPI_PORT, FPS, DOTSTAR: { N, FRAME_SIZE, START_FRAME_BYTE, END_FRAME_BYTE } } = settings;

const spi = SPI.initialize(SPI_PORT);

console.log(spi);
// const Osci = require('./oscillator.js');
// // const clamp = compose(min(CHANNEL_MAX), max(CHANNEL_MIN), parseInt);
// // const OsciRandomInits = () => ({ z: 255*Math.random(), v: (10000*Math.random())-5000 });
//
// // The master time keeper
// const timeKeeper = TimeKeeper(FPS);
//
// // Number of bytes needed for a complete update signal
// const END_FRAME_REPS = Math.ceil(N/2);
// const BUFFER_LENGTH = FRAME_SIZE * N + END_FRAME_REPS + FRAME_SIZE;
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
// // The raw binary buffer and terminal frames
// const binaryBuffer = new ArrayBuffer(BUFFER_LENGTH);
// const startFrame = new Uint8ClampedArray(binaryBuffer, 0, FRAME_SIZE).fill(START_FRAME_BYTE);
// // const endFrame = new Uint8ClampedArray(buffer, FRAME_SIZE + N*FRAME_SIZE, END_FRAME_REPS()).fill(END_FRAME_BYTE);
// const buffer = new Buffer(binaryBuffer);
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
