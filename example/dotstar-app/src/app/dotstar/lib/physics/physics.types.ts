export enum PhysicalConstName {
  Damping = 'damping',
  Friction = 'friction',
  Gravity = 'gravity',
  ParticleMass = 'particleMass',
  PointerForce = 'pointerForce',
  PointerSpread = 'pointerSpread',
}

export type PhysicalConst<T = number> = {
  name: PhysicalConstName;
  min: T;
  max: T;
  default: T;
  step: number;
  label: string;
};

export type PhysicsConfig = {
  [P in PhysicalConstName]: number;
};
