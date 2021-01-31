export const mapToRange = (
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
) => {
  const r = (d - c) / (b - a);
  return (x - a) * r + c;
};

export const range = (from: number, to: number): number[] => {
  const result = [];
  let n = from - 1;
  while (++n < to) result.push(n);
  return result;
};
