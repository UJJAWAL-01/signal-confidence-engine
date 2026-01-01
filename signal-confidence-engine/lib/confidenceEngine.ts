// src/lib/confidenceEngine.ts
import { computeFibPivots } from "./fibPivots";

export type Bar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ConfidenceResult = {
  score: number; // 0-100
  bias: "Bullish" | "Neutral" | "Bearish";
  breakdown: Record<string, number>;
};

export function computeConfidence(params: {
  bars: Bar[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  rsi14: (number | null)[];
}): ConfidenceResult {
  const { bars, sma50, sma200, rsi14 } = params;

  const i = bars.length - 1;

  // Need enough data for indicators
  if (i < 0 || sma50[i] == null || sma200[i] == null || rsi14[i] == null) {
    return {
      score: 50,
      bias: "Neutral",
      breakdown: {
        Trend: 0,
        Momentum: 0,
        Breakout: 0,
        Volume: 0,
      },
    };
  }

  const price = bars[i].close;
  const fast = sma50[i] as number;
  const slow = sma200[i] as number;
  const rsi = rsi14[i] as number;

  // --- Weights (total 100 in absolute contributions) ---
  // Trend: ±30, Momentum: ±25, Breakout: +15, Volume: +10
  let trendScore = 0;
  if (price > fast && fast > slow) trendScore = 30;
  else if (price < fast && fast < slow) trendScore = -30;

  let momentumScore = 0;
  if (rsi < 30) momentumScore = 25;
  else if (rsi > 70) momentumScore = -25;

  const lookback = Math.min(20, bars.length);
  const recentHigh = Math.max(...bars.slice(-lookback).map((b) => b.high));
  const breakoutScore = price >= recentHigh ? 15 : 0;

  const avgVol =
    bars.slice(-lookback).reduce((a, b) => a + b.volume, 0) / lookback;
  const volumeScore = bars[i].volume > avgVol ? 10 : 0;

  // === Fibonacci Pivot Score (20%) ===
let pivotScore = 0;

const prev = bars[i - 1];
if (prev) {
  const pivots = computeFibPivots(prev.high, prev.low, prev.close);
  const tolerance = price * 0.005; // 0.5%

  const bullish = price > fast && fast > slow;
  const bearish = price < fast && fast < slow;

  if (bullish) {
    if (Math.abs(price - pivots.S2) < tolerance) pivotScore = 20;
    else if (Math.abs(price - pivots.S1) < tolerance) pivotScore = 10;
    else if (Math.abs(price - pivots.R1) < tolerance) pivotScore = -10;
  }

  if (bearish) {
    if (Math.abs(price - pivots.R2) < tolerance) pivotScore = -20;
    else if (Math.abs(price - pivots.R1) < tolerance) pivotScore = -10;
    else if (Math.abs(price - pivots.S1) < tolerance) pivotScore = 5;
  }
}


  // rawScore ranges roughly from -55 to +55
  const rawScore = trendScore + momentumScore + breakoutScore + volumeScore + pivotScore;

  // Normalize to 0-100 with neutral at 50
  const score = Math.max(0, Math.min(100, rawScore + 50));

  let bias: ConfidenceResult["bias"] = "Neutral";
  if (score >= 65) bias = "Bullish";
  else if (score <= 35) bias = "Bearish";

  return {
    score,
    bias,
    breakdown: {
      Trend: trendScore,
      Momentum: momentumScore,
      Breakout: breakoutScore,
      Volume: volumeScore,
      FibonacciPivots: pivotScore,
    },
  };
}
