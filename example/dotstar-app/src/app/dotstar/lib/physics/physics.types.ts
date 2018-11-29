export enum PhysConstName {
  Friction = 'friction',
  Gravity = 'gravity',
  ParticleMass = 'particleMass',
  PointerForce = 'pointerForce',
  PointerSpread = 'pointerSpread',
}

export type PhysConst<T = number> = {
  name: PhysConstName;
  min: T;
  max: T;
  default: T;
  increments: number;
  // value: T;
  label: string;
};

export type PhysicsConfig = {
  [P in PhysConstName]: PhysConst;
};
