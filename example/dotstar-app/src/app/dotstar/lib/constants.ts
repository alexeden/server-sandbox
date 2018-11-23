export class DotstarConstants {
  static readonly url = `wss://${location.host}/api/dotstar`;
  static readonly devicePath = '/dev/null';
  static readonly fpsMax = 100;
  static readonly fpsMin = 1;
  static readonly rSampler = '(255/2) * Math.sin(2 * t/1000) *  Math.sin((Math.PI * 2 / n) * i - t / 2000) + (255/2)';
  static readonly gSampler = '(255 / 2) * Math.sin((Math.PI * 2 / n) * i + 2 * t / 1000) + (255 / 2)';
  static readonly bSampler = '255 * Math.sin(i / 15 - (Math.PI * 2 / n) * 50*t/1000)';
  // static readonly hSampler = '[0, 9, 25, 120, 240, 330][Math.floor(6*i/n)]';
  static readonly hSampler = '[330, 240, 120, 25, 9, 0][Math.floor(6*i/n)]';
  static readonly sSampler = '1';
  static readonly lSampler = '0.5 * (Math.sin(t/500 - i/n) > 0 ? 1 : 0)';
}

export enum Colors {
  Red = '#ff2b35',
  Green = '#76ff03',
  Blue = '#00e4ff',
}
