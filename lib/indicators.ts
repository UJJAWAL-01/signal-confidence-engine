// src/lib/indicators.ts

export function simpleMovingAverage(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i + 1 < period) {
      result.push(null);
      continue;
    }

    const slice = values.slice(i + 1 - period, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    result.push(Number(avg.toFixed(2)));
  }

  return result;
}

export function rsi(values: number[], period = 14): (number)[] {
  const result: (number)[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];

    if (i <= period) {
      if (diff >= 0) gains += diff;
      else losses -= diff;

      ;
      continue;
    }

    if (diff >= 0) {
      gains = (gains * (period - 1) + diff) / period;
      losses = (losses * (period - 1)) / period;
    } else {
      gains = (gains * (period - 1)) / period;
      losses = (losses * (period - 1) - diff) / period;
    }

    const rs = losses === 0 ? 100 : gains / losses;
    const rsiValue = 100 - 100 / (1 + rs);
    result.push(Number(rsiValue.toFixed(2)));
  }

  return [...result];
}
