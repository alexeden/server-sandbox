import { clamp } from 'ramda';
import * as SPI from 'pi-spi';
import { APA102C } from './apa102c';

export interface DotstarConfig {
  clockSpeed: number;
  devicePath: string;
  leds: number;
}

export class Dotstar {
  static async create(config: Partial<DotstarConfig> = {}): Promise<Dotstar> {
    const spi = SPI.initialize(config.devicePath || '/dev/spidev0.0');
    spi.clockSpeed(clamp(APA102C.CLK_MIN, APA102C.CLK_MAX, config.clockSpeed || 800_000));
    return new Dotstar(spi, Math.max(0, config.leds || 144));
  }

  private readonly buffer: Buffer;
  readonly frames: number;
  readonly bufferSize: number;

  private constructor(
    private readonly spi: SPI.SPI,
    readonly leds: number
  ) {
    this.frames = this.leds + 2;
    this.bufferSize = APA102C.FRAME_SIZE * this.frames;
    this.buffer = Buffer.alloc(this.bufferSize);

  }

  get clockSpeed() {
    return this.spi.clockSpeed();
  }


  async sync(): Promise<any> {
    return new Promise((ok, err) => {
      this.spi.write(this.buffer, (error, data) => {
        if (error) err(error);
        else ok(data);
      });
    });
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
