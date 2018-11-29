export interface PhysicsConfig {
  particleMass: number;
  friction: number;
  gravity: number;
  pointerForce: number;
  pointerSpread: number;
}

export enum PhysConstName {
  ParticleMass = 'particleMass',
  Friction = 'friction',
  Gravity = 'gravity',
  PointerForce = 'pointerForce',
  PointerSpread = 'pointerSpread',
}

export type PhysConst<T = number> = {
  name: PhysConstName;
  min: T;
  max: T;
  default: T;
  value: T;
  label: string;
};
