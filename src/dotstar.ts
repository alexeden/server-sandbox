import * as gradientString from 'gradient-string';
import { SPI, Mode } from 'spi-node';
import { DotstarConfig } from './types';
import { APA102C } from './apa102c';
import { range } from './utils';

export class Dotstar {
  static create(config: Partial<DotstarConfig> = {}): Dotstar {
    const devicePath = config.devicePath || '/dev/spidev0.0';
    const spi = SPI.fromDevicePath(devicePath);
    spi.speed = Math.max(APA102C.CLK_MIN, config.clockSpeed || APA102C.CLK_MIN);
    spi.mode = Mode.M0;

    return new Dotstar(
      spi,
      devicePath,
      Math.max(0, config.length || 144),
      config.startFrames || 1,
      config.endFrames || 4,
    );
  }

  private readonly buffer: Buffer;
  private readonly ledSlices: Buffer[];
  readonly totalFrames: number;
  readonly bufferSize: number;
  private closed = false;

  private constructor(
    private readonly spi: SPI,
    readonly devicePath: string,
    readonly length: number,
    readonly startFrames: number,
    readonly endFrames: number,
  ) {
    this.totalFrames = this.length + this.startFrames + this.endFrames;
    this.bufferSize = APA102C.FRAME_SIZE * this.totalFrames;
    this.buffer = Buffer.concat([
      ...range(0, this.startFrames).map(APA102C.startFrame),
      ...range(0, this.length).map(APA102C.ledFrame),
      ...range(0, this.endFrames).map(APA102C.startFrame),
    ]);

    this.ledSlices = range(0, this.length)
      .map((i) => (i + this.startFrames) * APA102C.FRAME_SIZE)
      .map((offset) => this.buffer.slice(offset + 1, offset + 4));
  }

  private write(led: Buffer, color: number) {
    color = color > 0xffffff ? 0 : color < 0 ? 0xffffff : color;
    led.writeUIntLE(color, 0, 3);
  }

  get speed() {
    return this.spi.speed;
  }

  get mode() {
    return this.spi.mode;
  }

  apply(fn: (color: number, index: number) => number) {
    this.ledSlices.forEach((led, i) => {
      this.write(led, fn(led.readUIntBE(0, 3), i));
    });
  }

  read(): number[] {
    return this.ledSlices.map((led) => led.readUIntBE(0, 3));
  }

  set(color: number, ...is: number[]) {
    is.filter((i) => i >= 0 && i < this.length).forEach((i) => {
      this.write(this.ledSlices[i], color);
    });
  }

  setAll(color: number) {
    this.ledSlices.forEach((slice) => this.write(slice, color));
  }

  async shutdown() {
    this.setAll(0);
    await this.sync();
    this.spi.close();
    this.closed = true;
  }

  async sync(): Promise<Buffer> {
    if (this.closed) console.warn('attempted to sync when SPI is closed!');
    if (this.devicePath === '/dev/null') return Buffer.of();
    return this.spi.write(this.buffer);
  }

  printBuffer(): string {
    const colors = this.read().map(
      (c) => `rgb(${c & 0xff}, ${(c >> 8) & 0xff}, ${(c >> 16) & 0xff})`,
    );
    const gradientGen =
      this.length < 2
        ? gradientString([...this.read(), ...this.read()])
        : gradientString(colors);
    return gradientGen(
      range(0, this.length)
        .map(() => '✹')
        .join(''),
    );
  }
}
