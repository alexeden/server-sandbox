import { Mode, SPI } from 'spi-node';
import { Protocol } from './protocol';
import { DotstarConfig } from './types';
import { range } from './utils';

export class Dotstar {
  static create(config: Partial<DotstarConfig> = {}): Dotstar {
    const devicePath = config.devicePath ?? '/dev/spidev0.0';
    const spi = SPI.fromDevicePath(devicePath);
    spi.speed = Math.max(
      Protocol.CLK_MIN,
      config.clockSpeed ?? Protocol.CLK_MIN,
    );
    spi.mode = Mode.M0;

    return new Dotstar(
      spi,
      devicePath,
      Math.max(0, config.length ?? 144),
      config.startFrames ?? 1,
      config.endFrames ?? 4,
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
    this.bufferSize = Protocol.FRAME_SIZE * this.totalFrames;
    this.buffer = Buffer.concat([
      ...range(0, this.startFrames).map(Protocol.startFrame),
      ...range(0, this.length).map(Protocol.ledFrame),
      ...range(0, this.endFrames).map(Protocol.startFrame),
    ]);

    this.ledSlices = range(0, this.length)
      .map((i) => (i + this.startFrames) * Protocol.FRAME_SIZE)
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

  set(color: number, ...indexes: number[]) {
    indexes.filter((i) => i >= 0 && i < this.length).forEach((i) => {
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
}
