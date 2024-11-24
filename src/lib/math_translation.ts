// The clamp function should take a number x, and return it clamped to the range [min, max]
export function clamp(x: number, min: number, max: number): number {
    return Math.min(Math.max(x, min), max);
}

// The linearMap function should take a number x, and map it from the range [originalMin, originalMax] to the range [targetMin, targetMax]
export function linearMap(x: number, originalMin: number, originalMax: number, targetMin: number, targetMax: number): number {
    return targetMin + (x - originalMin) * (targetMax - targetMin) / (originalMax - originalMin);
}