export const range = (min: number, max: number) => {
  const values = [];
  for (let i = min; i < max; i++) {
    values.push(i);
  }
  return values;
};
