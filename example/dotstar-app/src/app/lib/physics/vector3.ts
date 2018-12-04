interface Triplet {
  [Symbol.iterator]();
  [0]: number;
  [1]: number;
  [2]: number;
}

type Vector3ish = Vector3 | Triplet | number[];

export class Vector3 implements Triplet {
  static empty() {
    return new Vector3(0, 0, 0);
  }

  static of(...values: number[]) {
    return new Vector3(values[0], values[1], values[2]);
  }

  static from(vectorish: Vector3ish) {
    return new Vector3(vectorish[0], vectorish[1], vectorish[2]);
  }

  private constructor(
    readonly x: number,
    readonly y: number,
    readonly z: number
  ) {}

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }

  get [0]() { return this.x; }
  get [1]() { return this.y; }
  get [2]() { return this.z; }

  set0(x: number) { return this.setX(x); }
  set1(y: number) { return this.setY(y); }
  set2(z: number) { return this.setZ(z); }

  setX(x: number) { return new Vector3(x, this.y, this.z); }
  setY(y: number) { return new Vector3(this.x, y, this.z); }
  setZ(z: number) { return new Vector3(this.x, this.y, z); }

  asArray(): Triplet {
    return [this.x, this.y, this.z];
  }

  clone(): Vector3 {
    return Vector3.from(this);
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  private forceVector(arg: number | Vector3ish): Vector3ish {
    return typeof arg === 'number'
      ? [arg, arg, arg]
      : arg;
  }

  ceil(): Vector3 {
    return new Vector3(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
  }

  floor(): Vector3 {
    return new Vector3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }

  round(): Vector3 {
    return new Vector3(Math.round(this.x), Math.round(this.y), Math.round(this.z));
  }

  add(arg: number | Vector3ish): Vector3 {
    const [x, y, z] = this.forceVector(arg);
    return new Vector3(this.x + x, this.y + y, this.z + z);
  }

  plus(arg: number | Vector3ish): Vector3 {
    return this.add(arg);
  }

  subtract(arg: number | Vector3ish): Vector3 {
    const [x, y, z] = this.forceVector(arg);
    return new Vector3(this.x - x, this.y - y, this.z - z);
  }

  minus(arg: number | Vector3ish): Vector3 {
    return this.subtract(arg);
  }

  multiply(arg: number | Vector3ish): Vector3 {
    const [x, y, z] = this.forceVector(arg);
    return new Vector3(this.x * x, this.y * y, this.z * z);
  }

  times(arg: number | Vector3ish): Vector3 {
    return this.multiply(arg);
  }

  divide(arg: number | Vector3ish): Vector3 {
    const [x, y, z] = this.forceVector(arg);
    return new Vector3(this.x / x, this.y / y, this.z / z);
  }

  min(arg: number | Vector3ish): Vector3 {
    const [x, y, z] = this.forceVector(arg);
    return new Vector3(Math.min(this.x, x), Math.min(this.y, y), Math.min(this.z, z));
  }

  max(arg: number | Vector3ish): Vector3 {
    const [x, y, z] = this.forceVector(arg);
    return new Vector3(Math.max(this.x, x), Math.max(this.y, y), Math.max(this.z, z));
  }

  distanceFrom(v: Vector3ish): number {
    return Math.sqrt(this.squaredDistanceFrom(v));
  }

  squaredDistanceFrom([x, y, z]: Vector3ish): number {
    const dx = this.x - x;
    const dy = this.y - y;
    const dz = this.z - z;
    return dx * dx + dy * dy + dz * dz;
  }

  negate(): Vector3 {
    return new Vector3(-this.x, -this.y, -this.z);
  }

  invert(): Vector3 {
    return new Vector3(1 / this.x, 1 / this.y, 1 / this.z);
  }

  normalize(): Vector3 {
    let mag = this.magnitudeSquared();
    if (mag > 0) mag = 1 / Math.sqrt(mag);
    return new Vector3(this.x * mag, this.y * mag, this.z * mag);
  }

  setMagnitude(arg: number | Vector3ish) {
    const mag = Vector3.from(this.forceVector(arg)).magnitude();
    return this.normalize().multiply(mag);
  }
}
