// src/lib/signals.ts

export type Signal = {
  index: number;
  type: "BUY" | "SELL";
};

export function maCrossoverSignals(
  fast: (number | null)[],
  slow: (number | null)[]
): Signal[] {
  const signals: Signal[] = [];

  for (let i = 1; i < fast.length; i++) {
    if (
      fast[i - 1] !== null &&
      slow[i - 1] !== null &&
      fast[i] !== null &&
      slow[i] !== null
    ) {
      if (fast[i - 1]! < slow[i - 1]! && fast[i]! > slow[i]!) {
        signals.push({ index: i, type: "BUY" });
      }

      if (fast[i - 1]! > slow[i - 1]! && fast[i]! < slow[i]!) {
        signals.push({ index: i, type: "SELL" });
      }
    }
  }

  return signals;
}
