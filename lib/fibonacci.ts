export function fibonacciPivots(
  high: number,
  low: number,
  close: number
) {
  const pp = (high + low + close) / 3;
  const range = high - low;

  return {
    pp,
    r1: pp + 0.382 * range,
    r2: pp + 0.618 * range,
    s1: pp - 0.382 * range,
    s2: pp - 0.618 * range,
  };
}
