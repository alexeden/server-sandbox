interface Triplet {
  [0]: number;
  [1]: number;
  [2]: number;
}

export class Vector3 implements Triplet {
  static empty() {
    return new Vector3(0, 0, 0);
  }

  static of(...values: number[]) {
    return new Vector3(values[0], values[1], values[2]);
  }

  private constructor(
    readonly x: number,
    readonly y: number,
    readonly z: number
  ) {
  }

  get [0]() {
    return this.x;
  }

  get [1]() {
    return this.y;
  }

  get [2]() {
    return this.z;
  }

  asArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}
