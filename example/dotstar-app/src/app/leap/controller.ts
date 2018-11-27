import { Subject, Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { Frame } from './lib/frame';
import { Hand } from './lib/hand';
import { DeviceEventState, ServiceMessage, ControllerOptions, FrameMessage } from './lib/types';
import { Assertions } from './lib/assertions';


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

export interface FrameEventMap {
  blur: null;
  focus: null;
  newFrame: Frame;
  handAppeared: Hand;
  handDisappeared: number;
}

export type FrameEvent<K extends keyof FrameEventMap> = {
  type: K,
  state: FrameEventMap[K],
};


export class LeapController implements ControllerOptions {
  static protocolVersion = 6;

  static create(opts: Partial<ControllerOptions> = {}): LeapController {
    return new LeapController(
      opts.runInBackground || false,
      opts.host || '127.0.0.1',
      opts.optimizeHMD || false
    );
  }

  private readonly unsubscribe$ = new Subject<any>();
  private readonly frameEvents$ = new Subject<FrameEvent<any>>();
  readonly frameEvents: Observable<FrameEvent<any>>;
  private readonly socketConnected$ = new BehaviorSubject(false);
  readonly socketConnected: Observable<boolean>;
  private readonly deviceNotifications$ = new Subject<DeviceNotification>();
  readonly deviceNotifications: Observable<DeviceNotification>;
  private readonly focused: Observable<boolean>;

  private socket: WebSocket | null = null;

  // Protocol
  version: number;
  serviceVersion: string;

  // Frames
  handMap: { [id: number]: Hand } = {};
  private streamingCount = 0;
  private devices: { [id: string]: DeviceEventState } = {};


  private constructor(
    readonly runInBackground: boolean,
    readonly host: string,
    readonly optimizeHMD: boolean
  ) {
    this.socketConnected = this.socketConnected$.asObservable().pipe(distinctUntilChanged());
    this.deviceNotifications = this.deviceNotifications$.asObservable();
    this.frameEvents = this.frameEvents$.asObservable();

    this.focused = fromEvent(window.document, 'visibilitychange').pipe(
      map(() => !window.document.hidden),
      startWith(!window.document.hidden),
      distinctUntilChanged()
    );
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

  private pushFrameEvent<K extends keyof FrameEventMap>(type: K, state: FrameEventMap[K]) {
    this.frameEvents$.next({ type, state });
  }

  private handleFrameMessage(message: FrameMessage) {
    const frame = new Frame(message);
    // Track incoming and outgoing hands
    const existingHandIds = Object.keys(this.handMap);
    const frameHandIds = frame.hands.map(hand => `${hand.id}`);
    const missingHandIds = existingHandIds.filter(id => !frameHandIds.includes(id));
    const newHands = frame.hands.filter(hand => !existingHandIds.includes(`${hand.id}`));
    // Remove the missing hands from the hand map
    this.handMap = frame.hands.reduce((handMap, hand) => ({ ...handMap, [`${hand.id}`]: hand }), {});

    // Emit the new hands
    newHands.map(hand => this.pushFrameEvent('handAppeared', hand));

    // Emit the IDs of the missing hands
    missingHandIds.map(id => this.pushFrameEvent('handDisappeared', +id));
  }

  private handleServiceMessage(message: ServiceMessage) {
    this.version = message.version;
    this.serviceVersion = message.serviceVersion;

    this
      .send({ enableGestures: false })
      .send({ background: this.runInBackground })
      .send({ optimizeHMD: this.optimizeHMD });

    this.focused.pipe(takeUntil(this.unsubscribe$)).subscribe(focused => {
      console.log('sending focus change: ', focused);
      this.pushFrameEvent(focused ? 'focus' : 'blur', null);
      this.send({ focused });
    });
  }

  get url() {
    const secure = window.location.protocol === 'https:';
    const scheme = secure ? 'wss' : 'ws';
    const port = secure ? 6436 : 6437;
    return `${scheme}://${this.host}:${port}/v${LeapController.protocolVersion}.json`;
  }

  start(): this {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => this.socketConnected$.next(true);

    this.socket.onclose = () => this.stop();

    this.socket.onerror = error => {
      console.error('Leap socket error: ', error);
      this.stop();
    };

    this.socket.onmessage = ({ data }) => {
      const message: unknown = JSON.parse(data);
      if (Assertions.messageIsServiceType(message))     this.handleServiceMessage(message);
      else if (Assertions.messageIsDeviceType(message)) this.handleDeviceEvent(message.event.state);
      else if (Assertions.messageIsFrameType(message))  this.handleFrameMessage(message);
      else throw new Error(`Not sure how to handle this message: ${JSON.stringify(message, null, 4)}`);
    };

    return this;
  }

  streaming() {
    return this.streamingCount > 0;
  }

  stop(): this {
    if (!this.socket) {
      return this;
    }
    this.socket.close();
    this.socket = null;
    this.socketConnected$.next(false);
    this.unsubscribe$.next('unsubscribe!');
    return this;
  }

  private send(state: object): this {
    if (this.socketConnected$.getValue()) {
      this.socket!.send(JSON.stringify(state));
    }
    return this;
  }
}
