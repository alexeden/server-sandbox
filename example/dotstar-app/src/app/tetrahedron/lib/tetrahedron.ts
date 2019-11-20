import { TetrahedronConfigOptions } from '.';
import { TetrahedronConfig } from './types';
import { TetrahedronUtils } from './utils';

export class Tetrahedron {
  static fromConfigOptions(configOptions: TetrahedronConfigOptions): Tetrahedron {
    return new Tetrahedron(TetrahedronUtils.configFromOptions(configOptions));
  }

  private constructor(
    readonly config: TetrahedronConfig
  ) {

  }
}
