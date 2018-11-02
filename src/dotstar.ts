import { range } from 'ramda';
import * as SPI from 'pi-spi';
import { APA102C } from './apa102c';

export interface DotstarConfig {
  clockSpeed: number;
  dataMode: SPI.mode;
  devicePath: string;
  endFrames: number
  leds: number;
  startFrames: number,
}

export class Dotstar {
  static async create(config: Partial<DotstarConfig> = {}): Promise<Dotstar> {
    const spi = SPI.initialize(config.devicePath || '/dev/spidev0.0');

    spi.clockSpeed(Math.max(APA102C.CLK_MIN, config.clockSpeed || APA102C.CLK_MIN));
    spi.dataMode(typeof config.dataMode === 'number' ? config.dataMode : 0);

    return new Dotstar(
      spi,
      Math.max(0, config.leds || 144),
      config.startFrames || 1,
      config.endFrames || 4
    );
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
      .map(offset => this.buffer.slice(offset + 1, offset + 4));
  }

  get clockSpeed() {
    return this.spi.clockSpeed();
  }

  get dataMode() {
    return this.spi.dataMode();
  }

  set(color: number, ...is: number[]) {
    is.filter(i => i >= 0 && i < this.leds).forEach(i => {
      this.write(this.ledSlices[i], color);
    });
  }

  setAll(color: number) {
    this.ledSlices.forEach(slice => this.write(slice, color));
  }

  private write(led: Buffer, color: number) {
    color = color > 0xffffff ? 0 : color < 0 ? 0xffffff : color;
    led.writeUIntLE(color, 0, 3);
  }

  apply(fn: (color: number, index: number) => number) {
    this.ledSlices.forEach((led, i) => {
      const color = led.readUIntBE(0, 3);
      const newColor = fn(color, i);
      this.write(led, newColor);
    });
  }

  off() {
    this.setAll(0);
    this.syncing = false;
    return this.sync();
  }

  private syncing = false;

  async sync(): Promise<any> {
    if (this.syncing) return;
    this.syncing = true;
    return new Promise((ok, err) => {
      this.spi.write(this.buffer, (error, data) => {
        this.syncing = false;
        if (error) {
          console.error(error);
          err(error);
        }
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
