import { PhysicalConstName, PhysicalConst, PhysicsConfig } from './physics.types';

export const PHYSICAL_CONSTS: { [P in PhysicalConstName]: PhysicalConst } = {
  [PhysicalConstName.Damping]: {
    name: PhysicalConstName.Damping,
    min: -1,
    max: 2,
    default: 0.75,
    step: 0.01,
    label: 'Damping',
  },
  [PhysicalConstName.FluidDensity]: {
    name: PhysicalConstName.FluidDensity,
    min: 0,
    max: 100000,
    default: 1000,
    step: 1,
    label: 'Fluid Density',
  },
  [PhysicalConstName.Friction]: {
    name: PhysicalConstName.Friction,
    min: 0,
    max: 1,
    default: 0.97,
    step: 0.01,
    label: 'Friction',
  },
  [PhysicalConstName.Gravity]: {
    name: PhysicalConstName.Gravity,
    min: -Infinity,
    max: Infinity,
    default: 100,
    step: 1,
    label: 'Gravity',
  },
  [PhysicalConstName.ParticleMass]: {
    name: PhysicalConstName.ParticleMass,
    min: 1,
    max: Infinity,
    default: 1,
    step: 1,
    label: 'Particle Mass',
  },
  [PhysicalConstName.PointerForce]: {
    name: PhysicalConstName.PointerForce,
    min: -Infinity,
    max: Infinity,
    default: 1000,
    step: 1,
    label: 'Pointer Force',
  },
  [PhysicalConstName.PointerSpread]: {
    name: PhysicalConstName.PointerSpread,
    min: 1,
    max: 1000,
    default: 10,
    step: 1,
    label: 'Pointer Spread',
  },
  [PhysicalConstName.WorldClock]: {
    name: PhysicalConstName.WorldClock,
    min: 1,
    max: 1000,
    default: 10,
    step: 1,
    label: 'Update Period (ms)',
  },
};


export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig =
  Object.values(PHYSICAL_CONSTS).reduce<PhysicsConfig>(
    (accum, constant) => ({
      ...accum,
      [constant.name]: constant.default,
    }),
    {} as PhysicsConfig
  );
