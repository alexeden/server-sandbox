export class APA102C {
  static readonly CLK_MIN     = 800_000; // Hz
  static readonly CLK_MAX     = 1_200_000; // Hz
  static readonly START_BYTE  = 0x00;
  static readonly END_BYTE    = 0xFF;
  static readonly GLOBAL_BYTE = 0xFF;
  static readonly FRAME_SIZE  = 4; // bytes
  static readonly startFrame  = () => Buffer.allocUnsafe(APA102C.FRAME_SIZE).fill(APA102C.START_BYTE);
  static readonly endFrame    = () => Buffer.allocUnsafe(APA102C.FRAME_SIZE).fill(APA102C.END_BYTE);
  static readonly ledFrame    = () => Buffer.allocUnsafe(APA102C.FRAME_SIZE).fill(APA102C.GLOBAL_BYTE, 0, 1);
}
