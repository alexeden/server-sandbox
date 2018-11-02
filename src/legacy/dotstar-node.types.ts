// import * as SPI from 'pi-spi';


// export type Led = [number, number, number];

// export type LedFrame = [0xFF, number, number, number];

// export type LedOperation = ((leds: Led[]) => Led[]);

// export interface LedOperationSet {
//   fromString: (raw: string) => LedOperation;
//   write: (leds: Led[]) => LedOperation;
//   writeTo: (index: number, led: Led) => LedOperation;
//   writeToAll: (led: Led) => LedOperation;
//   shiftLeft: () => LedOperation;
//   shiftRight: () => LedOperation;
//   insertLeft: (led: Led) => LedOperation;
// }


// export interface DotstarConfig {
//   clockSpeed: number;
//   endFrameByte: number;
//   flushLength: number;
//   en: number;
//   mode: SPI.mode;
//   n: number;
//   order: SPI.order;
//   path: string;
//   startFrameByte: number;
// }
