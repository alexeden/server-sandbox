export class APA102C {
  static readonly CLK_MIN    =  800_000; // Hz
  static readonly CLK_MAX    =  1_200_000; // Hz
  static readonly FRAME_SIZE =  4; // bytes
  static startFrame() {
    return Buffer.from([0x00, 0x00, 0x00, 0x00]);
  }
  static endFrame() {
    return Buffer.from([0xff, 0xff, 0xff, 0xff]);
  }

}
