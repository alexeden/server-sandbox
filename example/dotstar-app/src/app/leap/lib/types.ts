import { vec3 } from 'gl-matrix';

export type Double<T>     = [T, T];
export type Triple<T>     = [T, T, T];
export type Quadruple<T>  = [T, T, T, T];
export type Nonet<T>      = Triple<Triple<T>>;

export type TouchZone
  = 'none'      /* The Pointable is outside the hovering zone. */
  | 'hovering'  /* The Pointable is close to, but not touching the touch plane. */
  | 'touching'; /* The Pointable has penetrated the touch plane. */

export type Basis = Triple<vec3>;

export interface ServiceMessage {
  serviceVersion: string;
  version: number;
}

export interface DeviceEventState {
  attached: boolean;
  id: string;
  streaming: boolean;
  type: 'peripheral';
}

export interface DeviceMessage {
  event: {
    state: DeviceEventState;
    type: 'deviceEvent';
  };
}

export interface FrameMessage {
  currentFrameRate: number;
  devices: any[];
  hands: HandData[];
  interactionBox: {
    center: Triple<number>;
    size: Triple<number>;
  };
  pointables: PointableData[];
  r: Nonet<number>;
  s: number;
  t: Triple<number>;
  timestamp: number;
}

export type Message
  = DeviceMessage
  | ServiceMessage
  | FrameMessage;

export enum FingerType {
  Thumb   = 0,
  Index   = 1,
  Middle  = 2,
  Ring    = 3,
  Pinky   = 4,
  Invalid = -1,
}

export enum BoneType {
  metacarpal  = 0,
  proximal    = 1,
  medial      = 2,
  distal      = 3,
  arm         = 4,
}

export enum HandType {
  Left = 'left',
  Right = 'right',
}

export interface ControllerOptions {
  host?: string;
  scheme?: string;
  port?: number;
  runInBackground?: boolean;
  optimizeHMD?: boolean;
}

export enum ControllerFocus {
  Focused = 'focus',
  Hidden = 'blur',
  Unknown = 'unknown',
}

export interface PointableData {
  direction: Triple<number>;
  handId: number;
  id: number;
  length: number;
  stabilizedTipPosition: Triple<number>;
  timeVisible: number;
  tipPosition: Triple<number>;
  tipVelocity: Triple<number>;
  touchDistance: number;
  touchZone: TouchZone;
  width: number;
}

export interface FingerData extends PointableData {
  bases: Quadruple<Nonet<number>>;
  btipPosition: Triple<number>;
  carpPosition: Triple<number>;
  dipPosition: Triple<number>;
  extended: boolean;
  mcpPosition: Triple<number>;
  pipPosition: Triple<number>;
  type: FingerType;
}

export interface HandData {
  armBasis: Nonet<number>;
  armWidth: number;
  confidence: number;
  direction: Triple<number>;
  elbow: Triple<number>;
  grabStrength: number;
  id: number;
  palmNormal: Triple<number>;
  palmPosition: Triple<number>;
  palmVelocity: Triple<number>;
  palmWidth: number;
  pinchStrength: number;
  r: Nonet<number>;
  s: number;
  sphereCenter: Triple<number>;
  sphereRadius: number;
  stabilizedPalmPosition: Triple<number>;
  t: Triple<number>;
  timeVisible: number;
  type: HandType;
  wrist: Triple<number>;
}
