export type Channels = 'r' | 'g' | 'b';

export type AnimationFn = (t: number, i: number, n: number) => number;

export const animationFnHead = '(t, i, n) =>';

export type ChannelAnimationFns = Record<Channels, AnimationFn>;
