import * as yargs from 'yargs';
import { Dotstar } from '../dotstar';
import { mapToRange, range } from '../utils';

const hsl2rgb = (h: number, s: number, l: number): [number, number, number] => {
  const c = s * (1 - Math.abs(2 * l - 1));
  const hue$ = h / 60;
  const x = c * (1 - Math.abs((hue$ % 2) - 1));

  // eslint-disable-next-line complexity
  const [r$, g$, b$] = (() => {
    if (hue$ >= 0 && hue$ <= 1) return [c, x, 0];
    if (hue$ >= 1 && hue$ <= 2) return [x, c, 0];
    if (hue$ >= 2 && hue$ <= 3) return [0, c, x];
    if (hue$ >= 3 && hue$ <= 4) return [0, x, c];
    if (hue$ >= 4 && hue$ <= 5) return [x, 0, c];
    if (hue$ >= 5 && hue$ <= 6) return [c, 0, x];
    return [0, 0, 0];
  })();

  const m = l - c / 2;

  return [0xff * (r$ + m), 0xff * (g$ + m), 0xff * (b$ + m)];
};

const {
  argv: { length },
} = yargs(process.argv.slice(1)).option('length', {
  alias: 'l',
  type: 'number',
  description: 'Number of LEDs',
  demandOption: 'The number of LEDs to test must be provided.',
});

const dotstar = Dotstar.create({ length });

dotstar.setAll(0);
dotstar.sync();

range(0, length - 1)
  .map((i) => mapToRange(0, length, 0, 0xff, i))
  .map((h) => hsl2rgb(h, 1, 0.5))
  .map(([r, g, b]) => ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff))
  .forEach((color, i) => dotstar.set(color, i));

dotstar.sync();

setTimeout(() => dotstar.shutdown(), 30000);
