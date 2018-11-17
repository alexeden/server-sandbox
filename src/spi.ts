import * as fs from 'fs';
import { Mode, Order } from './types';

type SpiSettings = Record<'mode' | 'order' | 'bitsPerWord' | 'speed', number | null>;

interface SpiTransferConfig {
  fd: number;
  speed: number;
  mode: number;
  order: number;
  buffer: Buffer;
  readcount: number;
}

type SpiTransferCallback = (error: Error | null, dataOut: Buffer | null) => void;

export interface SpiModule {
  modes: { [mode: string]: number };
  spiSupported: boolean;
  readSpiSettings(fd: number): SpiSettings;
  transfer(config: SpiTransferConfig, cb: SpiTransferCallback): void;
}

// tslint:disable-next-line:no-var-requires
const spicc = require('../build/Release/spi_binding');

export class SPI {
  private fd: number;

  constructor(
    readonly devicePath: string,
    readonly clockSpeed: number = 4e6,
    readonly dataMode: Mode = 0,
    readonly bitOrder: Order = Order.MSB_FIRST
  ) {
    this.fd = fs.openSync(this.devicePath, 'r+');
  }

  private async ffiTransfer(w: Buffer | null, readCount: number) {
    return new Promise<any>((ok, err) => {
      spicc.Transfer(this.fd, this.clockSpeed, this.dataMode, this.bitOrder, w, readCount, (error: unknown, data: unknown) => {
        if (error) {
          console.error('SPI transfer error: ', error);
          err(error);
        }
        else {
          ok(data);
        }
      });
    });
  }

  write(buffer: Buffer) {
    return this.ffiTransfer(buffer, 0);
  }

  read(readcount: number) {
    return this.ffiTransfer(null, readcount);
  }

  transfer(buffer: Buffer, readcount: number = buffer.length) {
    return this.ffiTransfer(buffer, readcount);
  }

  close() {
    fs.closeSync(this.fd);
  }
}
