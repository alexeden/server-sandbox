import { range } from 'ramda';
import { SPI } from './spi';
import { DotstarConfig } from './types';
import { APA102C } from './apa102c';

export class Dotstar {
  static async create(config: Partial<DotstarConfig> = {}): Promise<Dotstar> {
    return new Dotstar(
      new SPI(
        config.devicePath || '/dev/spidev0.0',
        Math.max(APA102C.CLK_MIN, config.clockSpeed || APA102C.CLK_MIN),
        typeof config.dataMode === 'number' ? config.dataMode : 0
      ),
      Math.max(0, config.leds || 144),
      config.startFrames || 1,
      config.endFrames || 4
    );
  }

  private readonly buffer: Buffer;
  private readonly ledSlices: Buffer[];
  readonly totalFrames: number;
  readonly bufferSize: number;

  private syncing = false;
  private closed = false;

  private constructor(
    private readonly spi: SPI,
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
    return this.spi.clockSpeed;
  }

  get dataMode() {
    return this.spi.dataMode;
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
    // if (this.syncing) {
    //   console.warn('writing to buffer while still syncing!');
    // }
    led.writeUIntLE(color, 0, 3);
  }

  apply(fn: (color: number, index: number) => number) {
    this.ledSlices.forEach((led, i) => {
      const color = led.readUIntBE(0, 3);
      const newColor = fn(color, i);
      this.write(led, newColor);
    });
  }

  async shutdown() {
    this.setAll(0);
    this.syncing = false;
    await this.sync();
    this.spi.close();
    this.closed = true;
  }

  async sync(): Promise<any> {
    if (this.syncing) return;
    if (this.closed) console.warn('attempted to sync when SPI is closed!');
    this.syncing = true;
    const bufferCopy = Buffer.from(this.buffer);
    await this.spi.write(bufferCopy);
    this.syncing = false;
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
