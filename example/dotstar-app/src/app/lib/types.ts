import { Observable } from 'rxjs';

export const samplerFnHead = '(t, i, n) =>';

export type Triplet<T> = [T, T, T];

export type Sample = Triplet<number>;

export type Sampler<T = number> = (t: number, i: number, n: number) => T;

export type ChannelSampler = Sampler<Sample>;

export type SamplerCombinator = (samplers: Triplet<Sampler>) => ChannelSampler;

export type BufferStreamGenerator = (sampler: ChannelSampler) => Observable<Sample[]>;

export enum Colorspace {
  RGB = 'rgb',
  HSL = 'hsl',
}
