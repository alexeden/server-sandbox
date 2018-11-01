import { clamp, range } from 'ramda';
import * as SPI from 'pi-spi';
import { APA102C } from './apa102c';

export interface DotstarConfig {
  clockSpeed: number;
  devicePath: string;
  leds: number;
  startFrames: number,
  endFrames: number
}

export class Dotstar {
  static async create(config: Partial<DotstarConfig> = {}): Promise<Dotstar> {
    const spi = SPI.initialize(config.devicePath || '/dev/spidev0.0');
    spi.clockSpeed(clamp(APA102C.CLK_MIN, APA102C.CLK_MAX, config.clockSpeed || APA102C.CLK_MIN));
    return new Dotstar(spi, Math.max(0, config.leds || 144), config.startFrames || 1, config.endFrames || 1);
  }

  private readonly buffer: Buffer;
  private readonly ledSlices: Buffer[];
  readonly totalFrames: number;
  readonly bufferSize: number;

  private constructor(
    private readonly spi: SPI.SPI,
    readonly leds: number,
    readonly startFrames: number,
    readonly endFrames: number
  ) {
    this.totalFrames = this.leds + this.startFrames + this.endFrames;
    this.bufferSize = APA102C.FRAME_SIZE * this.totalFrames;
    this.buffer = Buffer.concat([
      ...range(0, this.startFrames).map(APA102C.startFrame),
      ...range(0, this.leds).map(APA102C.ledFrame),
      ...range(0, this.endFrames).map(APA102C.startFrame),
    ]);

    this.ledSlices = range(0, this.leds)
      .map(i => (i + this.startFrames) * APA102C.FRAME_SIZE)
      .map(offset => this.buffer.slice(offset, offset + 3));
  }

  get clockSpeed() {
    return this.spi.clockSpeed();
  }

  set(color: number, ...is: number[]) {
    is.filter(i => i >= 0 && i < this.leds).forEach(i => {
      this.ledSlices[i].writeUIntBE(color, 0, 3);
    });
  }

  setAll(color: number) {
    this.ledSlices.forEach(slice => slice.writeUIntBE(color, 0, 3));
  }

  apply(fn: (color: number, index: number) => number) {
    this.ledSlices.forEach((led, i) => {
      const color = led.readUIntBE(0, 3);
      const newColor = fn(color, i);
      led.writeUIntBE(newColor, 0, 3);
    });
  }

  async sync(): Promise<any> {
    return new Promise((ok, err) => {
      this.spi.write(this.buffer, (error, data) => {
        if (error) err(error);
        else ok(data);
      });
    });
  }

  printBuffer(): string {
    const segments: string[] = [];
    let segment: string[] = [];

    for (let i = 0; i <= this.bufferSize; i++) {
      if (i > 0 && i % 4 === 0) {
        segments.push(segment.join('\t'));
        segment = [];
      }

      segment.push(`0x${this.buffer.slice(i, i + 1).toString('hex')}`);
    }

    return segments.join('\n');
  }
}

// export const spi = SPI.initialize(SPI_PORT);
// spi.clockSpeed(800_000);

// const toFrame = (r: number, g: number, b: number) => flatten([
//   ...range(0, 4).map(_ => START_FRAME_BYTE),
//   ...range(0, N).map(_ => [r, g, b, 0xFF]),
//   ...range(0, 4).map(_ => [0xFF, 0xFF, 0xFF, 0xFF]),
// ]);

// export const write = ([r, g, b]: [number, number, number]) => {
//   const frame = toFrame(r, g, b);
//   spi.write(Buffer.from(frame), (error, data) => {
//     if (error) console.error('error: ', error);
//   });
// };
