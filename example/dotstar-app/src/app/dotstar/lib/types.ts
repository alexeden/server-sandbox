export type RGB = 'r' | 'g' | 'b';
export type HSL = 'h' | 's' | 'l';

export type Sampler = (t: number, i: number, n: number) => number;

export const samplerFnHead = '(t, i, n) =>';

export type Sample = [ number, number, number ];

export type ChannelSamplers = [ Sampler, Sampler, Sampler ];
