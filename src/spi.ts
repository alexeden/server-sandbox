import * as fs from 'fs';

// tslint:disable-next-line:no-var-requires
const spicc = require('../build/Release/spi_binding');

export enum Mode {
  CPHA = 0x01,
  CPOL = 0x02,
}

export enum Order {
  MSB_FIRST = 0,
  LSB_FIRST = 1,
}

export class SPI {
  private fd: number;

  constructor(
    readonly path: string,
    readonly clockSpeed: number = 4e6,
    readonly dataMode: Mode = 0,
    readonly bitOrder: Order = Order.MSB_FIRST
  ) {
    this.fd = fs.openSync(this.path, 'r+');
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
