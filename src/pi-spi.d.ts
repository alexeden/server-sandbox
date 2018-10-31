/// <reference types="node" />

export = __PI_SPI;

declare namespace __PI_SPI {

  enum Mode {
    CPHA = 0x01,
    CPOL = 0x02,
  }

  enum Order {
    MSB_FIRST = 0,
    LSB_FIRST = 1,
  }

  type SpiCallback = (error: Error, data: Buffer) => void;

  function initialize(device: string): __PI_SPI.SPI;

  class SPI {
    clockSpeed(): number;
    clockSpeed(speed: number): void;

    dataMode(): number;
    dataMode(mode: mode): void;

    bitOrder(): number;
    bitOrder(order: order): void;


    write(writebuf: Buffer, cb: SpiCallback): void;
    read(readcount: number, cb: SpiCallback): void;

    transfer(writebuf: Buffer, cb: SpiCallback): void;
    transfer(writebuf: Buffer, readcount: number, cb: SpiCallback): void;

    close(): void;
  }
}
