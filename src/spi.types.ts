export type SpiSettings = Record<'mode' | 'order' | 'bitsPerWord' | 'speed', number | null>;

export interface SpiTransferConfig {
  fd: number;
  speed: number;
  mode: number;
  order: number;
  dataIn?: Buffer;
  readcount: number;
}

export type SpiTransferCallback = (error: Error | null, dataOut: Buffer | null) => void;

export interface SpiModule {
  modes: { [mode: string]: number };
  spiSupported: boolean;
  readSpiSettings(fd: number): SpiSettings;
  transfer(cb: SpiTransferCallback, config: SpiTransferConfig): void;
}
