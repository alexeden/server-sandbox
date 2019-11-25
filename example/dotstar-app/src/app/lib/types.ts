import { Observable } from 'rxjs';

export type Triplet<T> = [T, T, T];

export type Sample = Triplet<number>;

export type Sampler<T> = (t: number, i: number, data?: T) => number;
export type CombinedSampler<T> = (t: number, i: number, data?: T) => Sample;

/**
 * A function that receives the JS body of a function, as a string,
 * and returns a string that when evaluated (using `evel()`), is a sampler function.
 */
export type SamplerTemplate = (body: string) => string;

export type SamplerCombinator = <T>(samplers: Triplet<Sampler<T>>) => CombinedSampler<T>;

export type BufferStreamGenerator<T> = (sampler: CombinedSampler<T>) => Observable<Sample[]>;

export enum Colorspace {
  RGB = 'rgb',
  HSL = 'hsl',
}
