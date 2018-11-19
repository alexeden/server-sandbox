import * as fs from 'fs';
import { Mode, Order } from './types';
import { SpiModule, SpiTransferConfig } from './spi.types';

// tslint:disable-next-line:no-var-requires
const SpiModule: SpiModule = require('bindings')('spi');

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

  get config(): SpiTransferConfig {
    return {
      fd: this.fd,
      speed: this.clockSpeed,
      mode: this.dataMode,
      order: this.bitOrder,
      readcount: 0,
    };
  }
  private async ffiTransfer(dataIn: Buffer, readCount: number) {
    return new Promise<Buffer>((ok, err) => {
      const config = { ...this.config, dataIn };
      SpiModule.transfer(
        (error, dataOut) => {
          if (error) {
            console.error('SPI transfer error: ', error);
            err(error);
          }
          else ok(dataOut!);
        },
        config
      );
    });
  }

  write(buffer: Buffer) {
    return this.ffiTransfer(buffer, 0);
  }

  read(readcount: number) {
    return this.ffiTransfer(Buffer.alloc(0), readcount);
  }

  transfer(buffer: Buffer, readcount: number = buffer.length) {
    return this.ffiTransfer(buffer, readcount);
  }

  close() {
    fs.closeSync(this.fd);
  }
}
