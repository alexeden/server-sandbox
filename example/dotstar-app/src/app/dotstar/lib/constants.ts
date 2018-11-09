export class DotstarConstants {
  static readonly url = `wss://${location.host}/api/dotstar`;
  static readonly devicePath = '/dev/null';
  static readonly fpsMax = 100;
  static readonly fpsMin = 1;
  static readonly rSampler = '(255/2) * Math.sin(2 * t) *  Math.sin((Math.PI * 2 / n) * i - t / 2) + (255/2)';
  static readonly gSampler = '(255 / 2) * Math.sin((Math.PI * 2 / n) * i + 2 * t) + (255 / 2)';
  static readonly bSampler = '255 * Math.sin(i / 15 - (Math.PI * 2 / n) * 50*t)';
}
