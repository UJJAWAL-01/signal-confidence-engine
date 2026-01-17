// src/lib/confidenceEngine.ts
import { computeFibPivots } from "./fibPivots";
export type MarketBias = "Bullish" | "Bearish" | "Neutral";

export type ConfidenceBreakdown = {
  trend: number;
  momentum: number;
  volume: number;
  breakout: number;
  fibonacci: number;
};

export type ConfidenceResult = {
  score: number;
  bias: MarketBias;
  breakdown: ConfidenceBreakdown;
  reasons: string[];
};

type Bar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type ConfidenceInput = {
  bars: Bar[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  rsi14: (number | null)[];
};

export function computeConfidence({
  bars,
  sma50,
  sma200,
  rsi14,
}: ConfidenceInput) {
  const reasons: string[] = [];

  let trend = 0;
  let momentum = 0;
  let breakout = 0;
  let volume = 0;
  let fibonacci = 0;

  const lastIndex = bars.length - 1;
  const lastClose = bars[lastIndex]?.close;

  if (!lastClose) {
    return {
      score: 0,
      bias: "Neutral",
      breakdown: {},
      reasons: ["Insufficient data"],
    };
  }

  /* ---------------- TREND (30%) ---------------- */
  if (sma50[lastIndex] && sma200[lastIndex]) {
    if (sma50[lastIndex]! > sma200[lastIndex]!) {
      trend = 30;
      reasons.push("SMA50 above SMA200 (Bullish trend)");
    } else {
      trend = -30;
      reasons.push("SMA50 below SMA200 (Bearish trend)");
    }
  }

  /* ---------------- MOMENTUM (20%) ---------------- */
  if (rsi14[lastIndex]) {
    const rsi = rsi14[lastIndex]!;
    if (rsi > 55 && rsi < 70) {
      momentum = 20;
      reasons.push(`RSI healthy at ${rsi.toFixed(1)}`);
    } else if (rsi >= 70) {
      momentum = -10;
      reasons.push(`RSI overbought at ${rsi.toFixed(1)}`);
    } else if (rsi < 45) {
      momentum = -20;
      reasons.push(`RSI weak at ${rsi.toFixed(1)}`);
    }
  }

  /* ---------------- BREAKOUT (15%) ---------------- */
  const recentHigh = Math.max(...bars.slice(-20).map(b => b.high));
  if (lastClose > recentHigh * 0.995) {
    breakout = 15;
    reasons.push("Price near recent high (Breakout attempt)");
  }

  /* ---------------- VOLUME (15%) ---------------- */
  const avgVolume =
    bars.slice(-20).reduce((a, b) => a + b.volume, 0) / 20;
  if (bars[lastIndex].volume > avgVolume * 1.2) {
    volume = 15;
    reasons.push("Volume expansion confirms move");
  }

  /* ---------------- FIBONACCI PIVOT (20%) ---------------- */
  const prevBar = bars[lastIndex - 1];
  if (prevBar) {
    const pivot =
      (prevBar.high + prevBar.low + prevBar.close) / 3;
    const r1 =
      pivot + (prevBar.high - prevBar.low) * 0.382;
    const s1 =
      pivot - (prevBar.high - prevBar.low) * 0.382;

    if (lastClose > pivot && lastClose < r1) {
      fibonacci = 20;
      reasons.push("Price holding above Fibonacci pivot");
    } else if (lastClose < pivot && lastClose > s1) {
      fibonacci = -10;
      reasons.push("Price rejected near Fibonacci pivot");
    }
  }

  /* ---------------- FINAL SCORE ---------------- */
  let score =
    50 + trend + momentum + breakout + volume + fibonacci;

  score = Math.max(0, Math.min(100, score));

  let bias: MarketBias = "Neutral";
if (score >= 65) bias = "Bullish";
else if (score <= 35) bias = "Bearish";


  return {
    score,
    bias,
    breakdown: {
      trend,
      momentum,
      breakout,
      volume,
      fibonacci,
    },
    reasons,
  };
}
