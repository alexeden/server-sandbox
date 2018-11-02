import { Mode } from './spi';

export interface DotstarConfig {
  clockSpeed: number;
  dataMode: Mode;
  devicePath: string;
  endFrames: number
  leds: number;
  startFrames: number,
}
