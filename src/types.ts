import { Mode } from './spi';

export interface DotstarConfig {
  clockSpeed: number;
  dataMode: Mode;
  devicePath: string;
  endFrames: number;
  length: number;
  startFrames: number;
}
