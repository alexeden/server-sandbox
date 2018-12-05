import { Particle } from './particle';
import { Force, Constraint } from './types';

export class System {
  particles: Particle[] = [];


  next(t: number, fs: Force[] = [], constraints: Constraint[] = []) {
    this.particles = this.particles.map(p => p.next(t, fs, constraints));
  }
}
