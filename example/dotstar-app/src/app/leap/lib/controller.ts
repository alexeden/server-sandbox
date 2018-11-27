import { EventEmitter } from 'events';
import { Frame } from './frame';
import { Hand } from './hand';
import { DeviceEventState, ServiceMessage, ControllerFocus, ControllerOptions, Message, FrameMessage } from './types';
import { Subject, Observable } from 'rxjs';
import { Assertions } from './assertions';


/**
 * TODO: Remove EventEmitter subclassing. Create method that generates a
 * stream given an event name.
 */
export enum DeviceNotificationType {
  Attached = 'deviceAttached',
  Connected = 'deviceConnected',
  Disconnected = 'deviceDisconnected',
  Event = 'deviceEvent',
  Removed = 'deviceRemoved',
  Stopped = 'deviceStopped',
  Streaming = 'deviceStreaming',
  StreamingStarted = 'streamingStarted',
  StreamingStopped = 'streamingStopped',
}

export interface DeviceNotification {
  type: DeviceNotificationType;
  state: DeviceEventState;
}

export interface LeapControllerEventMap {
  blur: null;
  connect: null;
  disconnect: null;
  focus: null;
  frame: Frame;
  handAppeared: Hand;
  handDisappeared: number;
  animationFrameEnd: number;
  ready: ServiceMessage;
}


export class LeapController extends EventEmitter implements ControllerOptions {
  static protocolVersion = 6;

  on<K extends keyof LeapControllerEventMap>(eventName: K, cb: (arg: LeapControllerEventMap[K]) => void): this {
    return super.on(eventName, cb);
  }
  emit<K extends keyof LeapControllerEventMap>(eventName: K, arg: LeapControllerEventMap[K]): boolean {
    return super.emit(eventName, arg);
  }

  private readonly deviceNotifications$ = new Subject<DeviceNotification>();
  readonly deviceNotifications: Observable<DeviceNotification>;
  private reconnectionTimer: number | void;
  private focusedState = ControllerFocus.Unknown;

  private socket: WebSocket | null = null;
  connected = false;
  protocolVersionVerified = false;

  // Protocol
  version: number;
  serviceVersion: string;

  // Frames
  handMap: { [id: number]: Hand } = {};
  private streamingCount = 0;
  private devices: { [id: string]: DeviceEventState } = {};
  readonly frame = new Subject<Frame>();

  static create(opts: Partial<ControllerOptions> = {}): LeapController {
    return new LeapController(
      opts.runInBackground || false,
      opts.host || '127.0.0.1',
      opts.optimizeHMD || false
    );
  }

  private constructor(
    readonly runInBackground: boolean,
    readonly host: string,
    readonly optimizeHMD: boolean
  ) {
    super();
    this.deviceNotifications = this.deviceNotifications$.asObservable();
  }

  private pushDeviceNotification(type: DeviceNotificationType, state: DeviceEventState) {
    this.deviceNotifications$.next({ type, state });
  }

  private handleDeviceEvent(device: DeviceEventState) {
    const oldInfo = this.devices[device.id];

    // Grab a list of changed properties in the device device
    const changed: { [K in keyof DeviceEventState]?: boolean } = {};
    for (const property in device) {
      // If a property i doesn't exist the cache, or has changed...
      if (!oldInfo || !oldInfo.hasOwnProperty(property) || oldInfo[property] !== device[property]) {
        changed[property] = true;
      }
    }

    // Update the device list
    this.devices[device.id] = device;

    // Fire events based on change list
    if (changed.attached) {
      this.pushDeviceNotification(
        device.attached ? DeviceNotificationType.Attached : DeviceNotificationType.Removed,
        device
      );
    }

    if (!changed.streaming) {
      return;
    }
    else if (device.streaming) {
      this.streamingCount++;
      this.pushDeviceNotification(DeviceNotificationType.Streaming, device);
      if (this.streamingCount === 1) {
        this.pushDeviceNotification(DeviceNotificationType.StreamingStarted, device);
      }
      // if attached & streaming both change to true at the same time, that device was already streaming
      // when we connected.
      if (!changed.attached) {
        this.pushDeviceNotification(DeviceNotificationType.Connected, device);
      }
    }
    // When devices are attached all fields have changed, so don't send events for streaming being false.
    else if (!(changed.attached && device.attached)) {
      this.streamingCount--;
      this.pushDeviceNotification(DeviceNotificationType.Stopped, device);
      if (this.streamingCount === 0) {
        this.pushDeviceNotification(DeviceNotificationType.StreamingStopped, device);
      }
      this.pushDeviceNotification(DeviceNotificationType.Disconnected, device);
    }
  }

  private handleFrameMessage(message: FrameMessage) {
    const frame = new Frame(message);
    // Track incoming and outgoing hands
    const existingHandIds = Object.keys(this.handMap);
    const frameHandIds = frame.hands.map(hand => `${hand.id}`);
    const missingHandIds = existingHandIds.filter(id => !frameHandIds.includes(id));
    const newHands = frame.hands.filter(hand => !existingHandIds.includes(`${hand.id}`));
    // Remove the missing hands from the hand map
    this.handMap = frame.hands.reduce((map, hand) => ({ ...map, [`${hand.id}`]: hand }), {});

    // Emit the new hands
    newHands.map(hand => this.emit('handAppeared', hand));

    // Emit the IDs of the missing hands
    missingHandIds.map(id => this.emit('handDisappeared', +id));
  }

  private handleServiceMessage(message: ServiceMessage) {
    this.version = message.version;
    this.serviceVersion = message.serviceVersion;
    this.protocolVersionVerified = true;

    this.startFocusLoop()
      .send({ enableGestures: false })
      .send({ background: this.runInBackground })
      .send({ optimizeHMD: this.optimizeHMD });
  }

  get url() {
    const secure = window.location.protocol === 'https:';
    const scheme = secure ? 'wss:' : 'ws:';
    const port = secure ? 6436 : 6437;
    return `${scheme}://${this.host}:${port}/v${LeapController.protocolVersion}.json`;
  }

  start(): this {
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => this.handleOpen();
    this.socket.onclose = (data: CloseEvent) => this.handleClose(data);
    this.socket.onerror = error => console.error('Leap socket error: ', error);
    this.socket.onmessage = ({ data }) => {
      const message: unknown = JSON.parse(data);
      if (Assertions.messageIsServiceType(message))     this.handleServiceMessage(message);
      else if (Assertions.messageIsDeviceType(message)) this.handleDeviceEvent(message.event.state);
      else if (Assertions.messageIsFrameType(message))  this.handleFrameMessage(message);
      else throw new Error(`Not sure how to handle this message: ${JSON.stringify(message, null, 4)}`);
    };

    return this;
  }

  private reconnect() {
    if (this.connected) {
      this.stopReconnection();
    }
    else {
      this.stop(true);
      this.start();
    }
  }

  private startFocusLoop(): this {
    const visibilityChangeListener = () => {
      this.setFocused(
        window.document.hidden
        ? ControllerFocus.Hidden
        : ControllerFocus.Focused
      );
    };

    window.document.addEventListener('visibilitychange', visibilityChangeListener);
    this.on('disconnect', () =>
      window.document.removeEventListener('visibilitychange', visibilityChangeListener)
    );
    visibilityChangeListener();
    return this;
  }

  streaming() {
    return this.streamingCount > 0;
  }

  // By default, disconnect will prevent auto-reconnection.
  // Pass in true to allow the reconnection loop not be interrupted continue
  stop(allowReconnect = false): this {
    if (!allowReconnect) {
      this.stopReconnection();
    }
    if (!this.socket) {
      return this;
    }
    this.socket.close();
    this.socket = null;
    this.focusedState = ControllerFocus.Unknown;
    if (this.connected) {
      this.connected = false;
      this.emit('disconnect', null);
    }
    return this;
  }

  private handleOpen() {
    if (!this.connected) {
      this.connected = true;
      this.emit('connect', null);
    }
  }

  private send(state: object): this {
    if (this.connected) {
      this.socket!.send(JSON.stringify(state));
    }
    return this;
  }

  setFocused(focused: ControllerFocus): this {
    if (this.focusedState !== focused || this.focusedState === ControllerFocus.Unknown) {
      this.focusedState = focused;
      this.send({ focused: focused === ControllerFocus.Focused });
      this.emit(this.focusedState === ControllerFocus.Focused ? 'focus' : 'blur', null);
    }
    return this;
  }

  private handleClose(event: CloseEvent) {
    if (!this.connected) {
      return;
    }
    this.stop();

    // 1001 - an active connection is closed
    if (event.code === 1001) this.protocolVersionVerified = false;
    this.startReconnection();
  }

  private startReconnection() {
    if (!this.reconnectionTimer) {
      this.reconnectionTimer = window.setInterval(() => this.reconnect(), 500);
    }
  }

  private stopReconnection() {
    this.reconnectionTimer = window.clearInterval(this.reconnectionTimer as number);
  }
}
