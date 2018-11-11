export const range = (from: number, to: number) => {
  const result = [];
  let n = from;
  while (n < to) {
    result.push(n);
    n += 1;
  }
  return result;
};

export const clamp = (min: number, max: number) => (value: number) => {
  return Math.max(min, Math.min(max, value));
};

export const clampLoop = (min: number, max: number) => (value: number) => {
  const len = Math.abs(max - min);
  let a = value % len;

  if (a > max) a -= len;
  else if (a < min) a += len;

  return a;
};
