import { PhysicsConfig, PhysConstName } from './physics.types';

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  [PhysConstName.Friction]: {
    name: PhysConstName.Friction,
    min: 0,
    max: 1,
    default: 0.97,
    increments: 0.01,
    label: 'Friction',
  },
  [PhysConstName.Gravity]: {
    name: PhysConstName.Gravity,
    min: -Infinity,
    max: Infinity,
    default: 100,
    increments: 1,
    label: 'Gravity',
  },
  [PhysConstName.ParticleMass]: {
    name: PhysConstName.ParticleMass,
    min: 1,
    max: Infinity,
    default: 1,
    increments: 1,
    label: 'Particle Mass',
  },
  [PhysConstName.PointerForce]: {
    name: PhysConstName.PointerForce,
    min: -Infinity,
    max: Infinity,
    default: 1000,
    increments: 1,
    label: 'Pointer Force',
  },
  [PhysConstName.PointerSpread]: {
    name: PhysConstName.PointerSpread,
    min: 1,
    max: 1000,
    default: 10,
    increments: 1,
    label: 'Pointer Spread',
  },
};
