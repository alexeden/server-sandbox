// import { Observable } from 'rxjs';
// import { DotstarConfig } from './types';

// import * as SPI from 'pi-spi';
// import { Gpio } from 'onoff';

// export class Dotstar {
//   static frameLength = 4;

//   static create(config: Partial<DotstarConfig>): Dotstar {
//     return new Dotstar({
//       clockSpeed: 4e6,
//       en: 25,
//       endFrameByte: 0xFF,
//       flushLength: 5,
//       mode: SPI.mode.CPHA,
//       n: 144,
//       order: SPI.order.MSB_FIRST,
//       path: '/dev/spidev0.0',
//       startFrameByte: 0x00,
//       ...config
//     });
//   }

//   private en: Gpio;
//   private spi: SPI.SPI;
//   private startFrame: number[];
//   private endFrame: number[];
//   private buffer: Buffer;

//   private constructor(
//     public config: DotstarConfig
//   ) {
//     this.en = new Gpio(this.config.en, 'out');
//     this.startFrame = Array(Dotstar.frameLength).fill(this.config.startFrameByte);
//     this.endFrame = Array(Dotstar.frameLength).fill(this.config.endFrameByte);
//     const frames = Array(this.config.n).fill([0xFF, 0x00, 0x00, 0x00]);
//     const bufferFrames = this.startFrame.concat(...frames, this.endFrame);
//     this.buffer = Buffer.from(bufferFrames);

//     this.en.writeSync(1);
//   }

//   start(): this {
//     if (this.spi) {
//       throw new Error('spi already started!');
//     }

//     this.spi = SPI.initialize(this.config.path);
//     this.spi.clockSpeed(this.config.clockSpeed);
//     this.spi.bitOrder(this.config.order);

//     return this;
//   }

//   stop(): this {
//     console.log('stopping Dotstar');
//     this.en.unexport();
//     this.spi.close();
//     return this;
//   }

//   private get writeBuffer(): (buffer: Buffer) => Observable<Buffer> {
//     return Observable.bindNodeCallback(this.spi.write);
//   }

//   private get setEnable(): (value: number) => Observable<number> {
//     return Observable.bindNodeCallback(this.en.write);
//   }

//   sync(): Observable<any> {
//     this.en.writeSync(1);
//     return Observable.concat(
//       this.setEnable(1),
//       this.writeBuffer(this.buffer),
//       this.setEnable(0)
//     );
//   }

//   toString() {
//     return JSON.stringify(this, null, 4);
//   }

// }


// // const N = 144;
// // const FLUSH_BUFFERS = 5;
// // const SPI_PORT = '/dev/spidev0.0';
// // const START_FRAME_BYTE = 0x00;
// // const END_FRAME_BYTE = 0xFF;
// // const FREQ = 4000000;
// // const FRAME_BYTE_LENGTH = 4;
// // const START_FRAME = Array(FRAME_BYTE_LENGTH).fill(START_FRAME_BYTE);
// // const END_FRAME = Array(FRAME_BYTE_LENGTH).fill(END_FRAME_BYTE);
// // const ALL_OFF: Led[] = Array(N).fill([0x00, 0x00, 0x00]);

// // const spi = SPI.initialize(SPI_PORT);
// // spi.clockSpeed(FREQ);

// //
// // const ledsToFrames: ((leds: Led[]) => LedFrame[])
// //   = pipe(
// //       map(prepend(0xFF)),
// //       frames => [...START_FRAME, ...frames],
// //       frames => [...frames, repeat(END_FRAME, N/2)]
// //     );
// //
// // const ledsToBuffer: ((leds: Led[]) => Buffer)
// //   = pipe(
// //       ledsToFrames,
// //       frames => Buffer.from(frames)
// //     );
// //
// // const operations$ = new Subject<LedOperation>();
// //
// // export const leds$: Observable<Led[]>
// //   = operations$
// //       .scan((leds: Led[], fn): Led[] => fn(leds), ALL_OFF)
// //       .filter(leds => leds.length === N)
// //       .startWith(ALL_OFF);
// //
// // const frames$: Observable<LedFrame[]>
// //   = leds$.map(ledsToFrames);
// //
// // const _latestBuffer$
// //   = new BehaviorSubject<Buffer>(ledsToBuffer(ALL_OFF));
// //
// // const buffer$: Observable<Buffer>
// //   = frames$
// //       .map(frames => Buffer.from(frames))
// //       .do(buffer => _latestBuffer$.next(buffer));
// //
// // export const start
// //   = () =>
// //       new Promise((resolve) => {
// //           console.log(`SPI port is open with clock speed ${spi.clockSpeed()}`);
// //
// //           const flushBuffer = Buffer.concat(repeat(ledsToBuffer(ALL_OFF), FLUSH_BUFFERS));
// //
// //           spi.write(flushBuffer, _ => {
// //             console.log(`SPI flushed so I'm resolving the runner back to the app`);
// //             const subscription
// //               = Observable.concat(_latestBuffer$.take(1), buffer$)
// //                   .subscribe(buffer => spi.write(buffer, identity));
// //
// //             resolve({
// //               subscription,
// //               stop() {
// //                 spi.write(ledsToBuffer(ALL_OFF), __ => {
// //                   console.log(`Turning off the lights`);
// //                   // spi.close();
// //                 });
// //               }
// //             });
// //           });
// //
// //         });
// //
// //
// //
// // export const LedOperations: LedOperationSet
// //   = { fromString: raw => __ => JSON.parse(raw)
// //     , write: leds => __ => leds
// //     , writeTo: (index, led) => leds => leds.map((l, i) => i === index ? led : l)
// //     , writeToAll: led => (leds => leds.map(_ => led))
// //     , shiftLeft: () => ([l, ...ls]) => [...ls, l]
// //     , shiftRight: () => (converge(prepend, [last, init]) as LedOperation)
// //     , insertLeft: led => leds => [led, ...init(leds)]
// //     };
// //
// // export const apply
// //   = (...ops: LedOperation[]) =>
// //       operations$.next(
// //         ops.reduce((fn, op) => pipe(fn, op), identity as LedOperation)
// //       );
