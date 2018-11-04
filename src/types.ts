export enum Mode {
  CPHA = 0x01,
  CPOL = 0x02,
}

export enum Order {
  MSB_FIRST = 0,
  LSB_FIRST = 1,
}

export interface DotstarConfig {
  clockSpeed: number;
  dataMode: Mode;
  devicePath: string;
  endFrames: number;
  length: number;
  startFrames: number;
}
