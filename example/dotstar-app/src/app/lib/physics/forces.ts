import { Force } from './types';
import { Vector3 } from './vector3';

export class Forces {
  static drag(): Force {
    return p => {
      return Vector3.empty();
    };
  }
}
