import * as SPI from 'pi-spi';

export interface DotstarConfig {
  clockSpeed: number;
  dataMode: SPI.mode;
  devicePath: string;
  endFrames: number
  leds: number;
  startFrames: number,
}
