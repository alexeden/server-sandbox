import { ChannelSampler, Sampler, Triplet, Colorspace } from './types';
import { clamp, clampLoop } from './utils';

export class SamplerUtils {
  static samplersToChannelSampler(colorspace: Colorspace) {
    return (samplers: Triplet<Sampler>): ChannelSampler => {
      switch (colorspace) {
        case Colorspace.RGB:
          const [r, g, b] = samplers;
          return (...args) => [r(...args), g(...args), b(...args)];
        case Colorspace.HSL:
          return SamplerUtils.hslToRgb(samplers);
        default:
          throw new Error(`Invalid colorspace! "${colorspace}"`);
      }
    };
  }

  static hslToRgb([h, s, l]: Triplet<Sampler>): ChannelSampler {
    return (...args) => {
      const hue = clampLoop(0, 360)(h(...args));
      const sat = clamp(0, 1)(s(...args));
      const light = clamp(0, 1)(l(...args));

      const c = sat * (1 - Math.abs(2 * light - 1));
      const hue$ = hue / 60;
      const x = c * (1 - Math.abs(hue$ % 2 - 1));

      const [r$, g$, b$] = (() => {
        if (hue$ >= 0 && hue$ <= 1) return [c, x, 0];
        if (hue$ >= 1 && hue$ <= 2) return [x, c, 0];
        if (hue$ >= 2 && hue$ <= 3) return [0, c, x];
        if (hue$ >= 3 && hue$ <= 4) return [0, x, c];
        if (hue$ >= 4 && hue$ <= 5) return [x, 0, c];
        if (hue$ >= 5 && hue$ <= 6) return [c, 0, x];
        return [0, 0, 0];
      })();

      const m = light - c / 2;

      return [0xff * (r$ + m), 0xff * (g$ + m), 0xff * (b$ + m)];
    };
  }

}
