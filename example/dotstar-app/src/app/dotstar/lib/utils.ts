import { curryN, curry } from 'ramda';

export const range = (from: number, to: number) => {
  const result = [];
  let n = from - 1;
  while (++n < to) result.push(n);
  return result;
};

export const clamp = curry((min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value));
});

export const clampLoop = curry((min: number, max: number, value: number) => {
  const len = Math.abs(max - min);
  let a = value % len;
  if (a > max) a -= len;
  else if (a < min) a += len;
  return a;
});

export const absDiff = (a: number, b: number) => Math.abs(b - a);

export const normalize = curry((a: number, b: number, x: number) => (x - Math.min(a, b)) / absDiff(a, b));

export const mapToRange = curry((a: number, b: number, c: number, d: number, x: number) => {
  const r = (d - c) / (b - a);
  return (x - a) * r + c;
});
