export type RGB = 'r' | 'g' | 'b';
export type HSL = 'h' | 's' | 'l';

export const samplerFnHead = '(t, i, n) =>';

export type Triplet<T> = [T, T, T];

export type SamplerArgs = Parameters<Sampler>;

export type Sample = Triplet<number>;

export type Sampler<T = number> = (t: number, i: number, n: number) => T;

export type ChannelSampler = Sampler<Sample>;

export enum Colorspace {
  RGB = 'rgb',
  HSL = 'hsl',
}
