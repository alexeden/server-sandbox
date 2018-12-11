import { Particle } from './particle';
import { Force, Constraint } from './types';

export class System {
  particles: Particle[] = [];

  next(t: number, fs: Force[] = [], constraints: Constraint[] = []) {
    this.particles.forEach(p => {
      p.next(t, fs, constraints);
    });
  }
}
