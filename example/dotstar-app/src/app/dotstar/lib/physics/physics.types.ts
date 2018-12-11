export enum PhysicalConstName {
  Damping = 'damping',
  CalculationsPerFrame = 'calculationsPerFrame',
  FluidDensity = 'fluidDensity',
  Friction = 'friction',
  Gravity = 'gravity',
  ParticleMass = 'particleMass',
  PointerForce = 'pointerForce',
  PointerSpread = 'pointerSpread',
  WorldClock = 'worldClock',
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
