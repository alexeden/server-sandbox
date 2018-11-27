import { ServiceMessage, DeviceMessage, FrameMessage, PointableData, FingerData } from './types';

export class Assertions {

  static messageIsServiceType(message: any): message is ServiceMessage {
    return message !== null
      && typeof message === 'object'
      && typeof message.serviceVersion === 'string'
      && typeof message.version === 'number';
  }

  static messageIsDeviceType(message: any): message is DeviceMessage {
    return message !== null
      && typeof message === 'object'
      && typeof message.event === 'object'
      && typeof message.event.type === 'string'
      && message.event.type === 'deviceEvent';
  }

  static messageIsFrameType(message: any): message is FrameMessage {
    return message !== null
      && typeof message === 'object'
      && typeof message.currentFrameRate === 'number';
  }

  static pointableDataIsFinger(pointable: PointableData & { [prop: string]: any }): pointable is FingerData {
    return pointable.tool === false;
  }
}
