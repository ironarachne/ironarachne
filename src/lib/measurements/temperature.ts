export function cToK(c: number): number {
  return c + 273.15;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function fToK(f: number): number {
  return ((f - 32) * 5) / 9 + 273.15;
}

export function kToC(k: number): number {
  return k - 273.15;
}

export function kToF(k: number): number {
  return ((k - 273.15) * 9) / 5 + 32;
}
