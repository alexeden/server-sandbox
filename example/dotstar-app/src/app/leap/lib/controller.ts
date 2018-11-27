import { EventEmitter } from 'events';
import { Frame } from './frame';
import { Hand } from './hand';
import * as leap from './types';
import { Subject } from 'rxjs';
import { Assertions } from './assertions';


/**
 * TODO: Remove EventEmitter subclassing. Create method that generates a
 * stream given an event name.
 */
export interface LeapControllerEventMap {
  blur: null;
  connect: null;
  deviceAttached: leap.DeviceEventState;
  deviceConnected: leap.DeviceEventState;
  deviceDisconnected: leap.DeviceEventState;
  deviceEvent: leap.DeviceEventState;
  deviceRemoved: leap.DeviceEventState;
  deviceStopped: leap.DeviceEventState;
  deviceStreaming: leap.DeviceEventState;
  disconnect: null;
  focus: null;
  frame: Frame;
  handAppeared: Hand;
  handDisappeared: number;
  animationFrameEnd: number;
  ready: leap.ServiceMessage;
  streamingStarted: leap.DeviceEventState;
  streamingStopped: leap.DeviceEventState;
}


export class LeapController extends EventEmitter {
  static protocolVersion = 6;

  on<K extends keyof LeapControllerEventMap>(eventName: K, cb: (arg: LeapControllerEventMap[K]) => void): this {
    return super.on(eventName, cb);
  }
  emit<K extends keyof LeapControllerEventMap>(eventName: K, arg: LeapControllerEventMap[K]): boolean {
    return super.emit(eventName, arg);
  }

  runInBackground: boolean;
  enableGestures: boolean;
  host: string;
  optimizeHMD: boolean;
  readonly port: number;
  readonly scheme: string;
  private reconnectionTimer: number | void;
  private focusedState = leap.ControllerFocus.Unknown;

  private socket: WebSocket | null = null;
  connected = false;
  protocolVersionVerified = false;

  // Protocol
  version: number;
  serviceVersion: string;
  versionLong: string;

  // Frames
  lastFrame: Frame | null;
  handMap: { [id: number]: Hand } = {};
  private streamingCount = 0;
  private devices: { [id: string]: leap.DeviceEventState } = {};
  readonly frame = new Subject<Frame>();

  static create(opts: leap.ControllerOptions = {}): LeapController {
    return new LeapController(opts);
  }

  private constructor(
    opts: leap.ControllerOptions = {}
  ) {
    super();
    this.runInBackground = opts.runInBackground || false;
    this.host = opts.host || '127.0.0.1';
    this.optimizeHMD = opts.optimizeHMD || false;
    this.port = opts.port || 6437;
    this.scheme = opts.scheme || 'ws';

    this.on('ready', () => {
      this.startFocusLoop()
        .setGesturesEnabled(false)
        .setBackground(this.runInBackground)
        .setOptimizeHMD(this.optimizeHMD);
    });

    this.lastFrame = null;

    this.on('frame', (frame: Frame) => {
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

      this.lastFrame = frame;
    });

    this.on('deviceEvent', (device: leap.DeviceEventState) => {
      const oldInfo = this.devices[device.id];

      // Grab a list of changed properties in the device device
      const changed: any = {};
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
        this.emit(device.attached ? 'deviceAttached' : 'deviceRemoved', device);
      }

      if (!changed.streaming) return;

      if (device.streaming) {
        this.streamingCount++;
        this.emit('deviceStreaming', device);
        if (this.streamingCount === 1) {
          this.emit('streamingStarted', device);
        }
        // if attached & streaming both change to true at the same time, that device was streaming
        // already when we connected.
        if (!changed.attached) {
          this.emit('deviceConnected', device);
        }
      }
      // Since when devices are attached all fields have changed, don't send events for streaming being false.
      else if (!(changed.attached && device.attached)) {
        this.streamingCount--;
        this.emit('deviceStopped', device);
        if (this.streamingCount === 0) {
          this.emit('streamingStopped', device);
        }
        this.emit('deviceDisconnected', device);
      }
    });

    // this.startAnimationLoop(); // immediately when started
  }

  useSecure() {
    return window.location.protocol === 'https:';
  }

  getScheme() {
    return this.useSecure() ? 'wss:' : 'ws:';
  }

  getPort() {
    return this.useSecure() ? 6436 : 6437;
  }

  start(): this {
    this.socket = new WebSocket(this.getUrl());
    this.socket.onopen = () => this.handleOpen();
    this.socket.onclose = (data: CloseEvent) => this.handleClose(data);
    this.socket.onmessage = message => this.routeMessage(JSON.parse(message.data));

    this.socket.onerror = error => {
      // attempt to degrade to ws: after one failed attempt for older Leap Service installations.
      // if (this.useSecure() && this.scheme === 'wss:') {
      //   this.scheme = 'ws:';
      //   this.port = 6437;
      //   this.stop();
      //   this.start();
      // }
    };
    return this;
  }

  private routeMessage(message: leap.Message) {
    if (Assertions.messageIsServiceType(message)) {
      this.version = message.version;
      this.serviceVersion = message.serviceVersion;
      this.versionLong = 'Version ' + message.version;
      this.protocolVersionVerified = true;
      this.emit('ready', message);
    }
    else if (Assertions.messageIsDeviceType(message)) {
      const { event } = message;
      this.emit('deviceEvent', event.state);
    }
    else if (Assertions.messageIsFrameType(message)) {
      const frame = new Frame(message);
      this.emit('frame', frame);
      this.frame.next(frame);
    }
    else {
      throw new Error(`Not sure how to handle this message: ${JSON.stringify(message, null, 4)}`);
    }
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
        ? leap.ControllerFocus.Hidden
        : leap.ControllerFocus.Focused
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
    delete this.runInBackground; // This is not persisted when reconnecting to the web socket server
    delete this.optimizeHMD;
    this.focusedState = leap.ControllerFocus.Unknown;
    if (this.connected) {
      this.connected = false;
      this.emit('disconnect', null);
    }
    return this;
  }

  getUrl() {
    return `${this.scheme}://${this.host}:${this.port}/v${LeapController.protocolVersion}.json`;
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

  setBackground(background: boolean): this {
    if (this.runInBackground !== background) {
      this.runInBackground = background;
      this.send({ background });
    }
    return this;
  }

  setFocused(focused: leap.ControllerFocus): this {
    if (this.focusedState !== focused || this.focusedState === leap.ControllerFocus.Unknown) {
      this.focusedState = focused;
      this.send({ focused: focused === leap.ControllerFocus.Focused });
      this.emit(this.focusedState === leap.ControllerFocus.Focused ? 'focus' : 'blur', null);
    }
    return this;
  }

  setOptimizeHMD(optimizeHMD: boolean): this {
    if (this.optimizeHMD !== optimizeHMD) {
      this.optimizeHMD = optimizeHMD;
      this.send({ optimizeHMD });
    }
    return this;
  }

  setGesturesEnabled(enableGestures: boolean): this {
    if (this.enableGestures !== enableGestures) {
      this.enableGestures = enableGestures ? true : false;
      this.send({ enableGestures });
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
