export type AnimationFunction = (t: number, i: number) => number;

export type AnimationFunctions = Record<'r' | 'g' | 'b', AnimationFunction>;
