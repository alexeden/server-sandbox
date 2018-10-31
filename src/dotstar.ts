import { range, flatten } from 'ramda';
import * as SPI from 'pi-spi';

const START_FRAME_BYTE = 0x00;
const END_FRAME_BYTE = 0xFF;
const SPI_PORT = '/dev/spidev0.0';
const N = 144;
const FREQ = 800000;
const FRAME_SIZE = 4;
const END_FRAME_OFFSET = FRAME_SIZE * (N + 1);
const BUFFER_LENGTH = FRAME_SIZE * (N + 2);
const BUFFER = new ArrayBuffer(BUFFER_LENGTH);
const START_FRAME = new Uint8ClampedArray(BUFFER, 0, FRAME_SIZE).fill(START_FRAME_BYTE);
const END_FRAME = new Uint8ClampedArray(BUFFER, END_FRAME_OFFSET, FRAME_SIZE).fill(END_FRAME_BYTE);
const binaryBuffer = new ArrayBuffer(BUFFER_LENGTH);
const startFrame = new Uint8ClampedArray(binaryBuffer, 0, FRAME_SIZE).fill(START_FRAME_BYTE);
const endFrame = new Uint8ClampedArray(binaryBuffer, END_FRAME_OFFSET, FRAME_SIZE).fill(END_FRAME_BYTE);

const rgb = (i: number): number[] => {
  switch (i % 3) {
    case 0:
      return [0x00, 0x00, 0x00];
    case 1:
      return [0x00, 0x77, 0x00];
    default:
      return [0x00, 0x00, 0xFF];
  }
};

// const ledFrames
//   = range(0, N)
//       .map(n => START_FRAME.byteLength * (n + 1))
//       .map((byteOffset, n) =>
//         new Uint8ClampedArray(BUFFER, byteOffset, FRAME_SIZE)
//       )
//       .map((frame, n) => {
//         frame[0] = 0xFF;
//         rgb(n).map((c, i) => frame[i + 1] = c);
//         return frame;
//       });


// const buffer = new Buffer(BUFFER);
const spi = SPI.initialize(SPI_PORT);
spi.clockSpeed(800000);

const buf =
  flatten([
    ...range(0, 4).map(_ => START_FRAME_BYTE),
    ...range(0, N).map(_ => [0xFF, 0xFF, 0x00, 0xFF]),
    ...range(0, 4).map(_ => [0xFF, 0xFF, 0xFF, 0xFF]),
  ]);

// const buffer = Buffer.from(BUFFER);

export const write = () => spi.write(buffer, (error, data) =>
    error
    ? console.error('error: ', error)
    : setTimeout(write, 5000)
);


const buffer = Buffer.from(buf);
