import { range, flatten } from 'ramda';
import * as SPI from 'pi-spi';

const START_FRAME_BYTE = 0x00;
const SPI_PORT = '/dev/spidev0.0';
const N = 145;

export interface DotstarConfig {
  clockSpeed: number;
  devicePath: string;
  n: number;
}

export class Dotstar {



  static async create(config: Partial<DotstarConfig> = {}): Promise<Dotstar> {
    const spi = SPI.initialize(config.devicePath || '/dev/spidev0.0');
    spi.clockSpeed(config.clockSpeed || 4e6);
    return new Dotstar(spi);
  }

  private readonly buffer: Buffer;

  private constructor(
    private spi: SPI.SPI
  ) {
    this.buffer = Buffer.from([]);
  }


  async push(): Promise<any> {
    return new Promise((ok, err) => {
      this.spi.write(this.buffer, (error, data) => {
        if (error) err(error);
        else ok(data);
      });
    });
  }

}

export const spi = SPI.initialize(SPI_PORT);
spi.clockSpeed(800000);

const toFrame = (r: number, g: number, b: number) => flatten([
  ...range(0, 4).map(_ => START_FRAME_BYTE),
  ...range(0, N).map(_ => [r, g, b, 0xFF]),
  ...range(0, 4).map(_ => [0xFF, 0xFF, 0xFF, 0xFF]),
]);

export const write = ([r, g, b]: [number, number, number]) => {
  const frame = toFrame(r, g, b);
  spi.write(Buffer.from(frame), (error, data) => {
    if (error) console.error('error: ', error);
  });
};
