export class Protocol {
  static readonly CLK_MIN = 800_000; // Hz
  static readonly CLK_MAX = 1_200_000; // Hz
  static readonly START_BYTE = 0x00;
  static readonly END_BYTE = 0xff;
  static readonly GLOBAL_BYTE = 0xff;
  static readonly FRAME_SIZE = 4; // bytes
  static readonly startFrame = () =>
    Buffer.allocUnsafe(Protocol.FRAME_SIZE).fill(Protocol.START_BYTE);
  static readonly endFrame = () =>
    Buffer.allocUnsafe(Protocol.FRAME_SIZE).fill(Protocol.END_BYTE);
  static readonly ledFrame = () =>
    Buffer.allocUnsafe(Protocol.FRAME_SIZE).fill(Protocol.GLOBAL_BYTE, 0, 1);
}
