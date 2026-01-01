export type FibPivots = {
  P: number;
  R1: number;
  R2: number;
  R3: number;
  S1: number;
  S2: number;
  S3: number;
};

export function computeFibPivots(prevHigh: number, prevLow: number, prevClose: number): FibPivots {
  const P = (prevHigh + prevLow + prevClose) / 3;
  const range = prevHigh - prevLow;

  return {
    P,
    R1: P + 0.382 * range,
    R2: P + 0.618 * range,
    R3: P + 1.0 * range,
    S1: P - 0.382 * range,
    S2: P - 0.618 * range,
    S3: P - 1.0 * range,
  };
}
