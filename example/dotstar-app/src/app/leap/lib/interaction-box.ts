import { vec3 } from 'gl-matrix';

export class InteractionBox {
  readonly width: number;
  readonly height: number;
  readonly depth: number;

  constructor(
    readonly center: vec3,
    readonly size: vec3
  ) {
    this.width = this.size[0];
    this.height = this.size[1];
    this.depth = this.size[2];
  }

  normalizePoint(position: [ number, number, number ], clamp: boolean) {
    const vec = vec3.fromValues(
      ((position[0] - this.center[0]) / this.size[0]) + 0.5,
      ((position[1] - this.center[1]) / this.size[1]) + 0.5,
      ((position[2] - this.center[2]) / this.size[2]) + 0.5
    );

    if (clamp) {
      vec[0] = Math.min(Math.max(vec[0], 0), 1);
      vec[1] = Math.min(Math.max(vec[1], 0), 1);
      vec[2] = Math.min(Math.max(vec[2], 0), 1);
    }

    return vec;
  }

  denormalizePoint(normalizedPosition: [ number, number, number ]): vec3 {
    return vec3.fromValues(
      (normalizedPosition[0] - 0.5) * this.size[0] + this.center[0],
      (normalizedPosition[1] - 0.5) * this.size[1] + this.center[1],
      (normalizedPosition[2] - 0.5) * this.size[2] + this.center[2]
    );
  }

  toString() {
    return 'InteractionBox [ width:' + this.width + ' | height:' + this.height + ' | depth:' + this.depth + ' ]';
  }
}
