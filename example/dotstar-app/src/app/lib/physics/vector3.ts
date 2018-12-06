type Triple = [number, number, number];
type VectorLike = Vector3 | Triple | number[];

export type Axis = 'x' | 'y' | 'z';

export class Vector3 {

  static empty() {
    return new Vector3(0, 0, 0);
  }

  static of(...values: number[]) {
    return new Vector3(values[0], values[1], values[2]);
  }

  static from(vectorish: VectorLike) {
    return new Vector3(vectorish[0], vectorish[1], vectorish[2]);
  }

  static random() {
    return new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
  }

  readonly length = 3;

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

  private makeVectorLike(arg: number | VectorLike): VectorLike {
    return typeof arg === 'number'
      ? [arg, arg, arg]
      : arg;
  }

  get [0]() { return this.x; }
  get [1]() { return this.y; }
  get [2]() { return this.z; }

  setX(x: number): Vector3 { return new Vector3(x, this.y, this.z); }
  setY(y: number): Vector3 { return new Vector3(this.x, y, this.z); }
  setZ(z: number): Vector3 { return new Vector3(this.x, this.y, z); }
  setAxis(axis: Axis, v: number): Vector3 {
    return new Vector3(
      axis === 'x' ? v : this.x,
      axis === 'y' ? v : this.y,
      axis === 'z' ? v : this.z
    );
  }

  asArray(): Triple {
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

  clamp(xMin: number, xMax: number, yMin = xMin, yMax = xMax, zMin = xMin, zMax = xMax): Vector3 {
    return  new Vector3(
      Math.max(xMin, Math.min(xMax, this.x)),
      Math.max(yMin, Math.min(yMax, this.y)),
      Math.max(zMin, Math.min(zMax, this.z))
    );
  }

  apply(fn: (n: number) => number): Vector3 {
    return new Vector3(fn(this.x), fn(this.y), fn(this.z));
  }

  ceil(): Vector3 {
    return this.apply(Math.ceil);
  }

  floor(): Vector3 {
    return this.apply(Math.floor);
  }

  round(): Vector3 {
    return this.apply(Math.round);
  }

  abs(): Vector3 {
    return this.apply(Math.abs);
  }

  add(arg: number | VectorLike): Vector3 {
    const [x, y, z] = this.makeVectorLike(arg);
    return new Vector3(this.x + x, this.y + y, this.z + z);
  }

  plus(arg: number | VectorLike): Vector3 {
    return this.add(arg);
  }

  subtract(arg: number | VectorLike): Vector3 {
    const [x, y, z] = this.makeVectorLike(arg);
    return new Vector3(this.x - x, this.y - y, this.z - z);
  }

  minus(arg: number | VectorLike): Vector3 {
    return this.subtract(arg);
  }

  multiply(arg: number | VectorLike): Vector3 {
    const [x, y, z] = this.makeVectorLike(arg);
    return new Vector3(this.x * x, this.y * y, this.z * z);
  }

  times(arg: number | VectorLike): Vector3 {
    return this.multiply(arg);
  }

  divide(arg: number | VectorLike): Vector3 {
    const [x, y, z] = this.makeVectorLike(arg);
    return new Vector3(this.x / x, this.y / y, this.z / z);
  }

  min(arg: number | VectorLike): Vector3 {
    const [x, y, z] = this.makeVectorLike(arg);
    return new Vector3(Math.min(this.x, x), Math.min(this.y, y), Math.min(this.z, z));
  }

  max(arg: number | VectorLike): Vector3 {
    const [x, y, z] = this.makeVectorLike(arg);
    return new Vector3(Math.max(this.x, x), Math.max(this.y, y), Math.max(this.z, z));
  }

  distanceFrom(v: VectorLike): number {
    return Math.sqrt(this.squaredDistanceFrom(v));
  }

  squaredDistanceFrom([x, y, z]: VectorLike): number {
    const dx = this.x - x;
    const dy = this.y - y;
    const dz = this.z - z;
    return dx * dx + dy * dy + dz * dz;
  }

  negate(): Vector3  { return new Vector3(-this.x, -this.y, -this.z); }
  negateX(): Vector3 { return new Vector3(-this.x, this.y, this.z);   }
  negateY(): Vector3 { return new Vector3(this.x, -this.y, this.z);   }
  negateZ(): Vector3 { return new Vector3(this.x, this.y, -this.z);   }

  invert(): Vector3 {
    return new Vector3(1 / this.x, 1 / this.y, 1 / this.z);
  }

  normalize(): Vector3 {
    let mag = this.magnitudeSquared();
    if (mag > 0) mag = 1 / Math.sqrt(mag);
    return new Vector3(this.x * mag, this.y * mag, this.z * mag);
  }

  setMagnitude(arg: number | VectorLike): Vector3 {
    const mag = Vector3.from(this.makeVectorLike(arg)).magnitude();
    return this.normalize().multiply(mag);
  }

  lerp(target: Vector3, t: number): Vector3 {
    return new Vector3(
      this.x + t * (target[0] - this.x),
      this.y + t * (target[1] - this.y),
      this.z + t * (target[2] - this.z)
    );
  }
}
