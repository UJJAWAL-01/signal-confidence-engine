import { fibonacciPivots } from "./fibonacci";

type Bar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ConfidenceBias = "Bullish" | "Neutral" | "Bearish" | "Neutral to Bullish"| "Neutral to Bearish";

export type Breakdown = {
  trend: number;
  momentum: number;
  volume: number;
  fibonacci: number;
};

export type score = {
  score: number;
  bias: ConfidenceBias;
  reasons: string[];
};

type Params = {
  closes: number[];
  bars: Bar[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  rsi14: number[];
};

export function computeConfidence({
  bars,
  closes,
  sma50,
  sma200,
  rsi14,
}: Params) {
  const last = bars.at(-1);
  if (!last) {
    return {
      score: 0,
      bias: "Neutral" as ConfidenceBias,
      breakdown: { trend: 0, momentum: 0, volume: 0, fibonacci: 0 },
      reasons: ["Insufficient data"],
    };
  }

  let score = 0;
  const reasons: string[] = [];

  const breakdown: Breakdown = {
    trend: 0,
    momentum: 0,
    volume: 0,
    fibonacci: 0,
  };

  /* ===========================
     1️⃣ TREND (35%)
     =========================== */
  const s50 = sma50.at(-1);
  const s200 = sma200.at(-1);

  if (s50 && s200) {
    const trendStrength = ((s50 - s200) / s200) * 100;

    let trendScore = 0;
    if (trendStrength > 2) trendScore = 35;
    else if (trendStrength > 0.5) trendScore = 25;
    else if (trendStrength > -0.5) trendScore = 15;
    else trendScore = 5;

    breakdown.trend = trendScore;
    score += trendScore;

    reasons.push(
      trendScore >= 25
        ? "Short-term trend is clearly above long-term average"
        : "Trend is weak or ranging relative to long-term average"
    );
  }

  /* ===========================
     2️⃣ MOMENTUM – RSI (25%)
     =========================== */
  const rsi = rsi14.at(-1) ?? 50;
  let rsiScore = 0;

  if (rsi > 60 && rsi < 70) rsiScore = 25;
  else if (rsi >= 50) rsiScore = 18;
  else if (rsi >= 40) rsiScore = 12;
  else rsiScore = 5;

  breakdown.momentum = rsiScore;
  score += rsiScore;

  reasons.push(
    rsiScore >= 18
      ? "Momentum supports continuation"
      : "Momentum is neutral or weakening"
  );

  /* ===========================
     3️⃣ VOLUME (20%)
     =========================== */
  const recentVolumes = bars.slice(-20).map((b) => b.volume);
  const avgVolume =
    recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;

  const volRatio = last.volume / avgVolume;

  let volumeScore = 0;
  if (volRatio >= 1.5) volumeScore = 20;
  else if (volRatio >= 1.2) volumeScore = 14;
  else if (volRatio >= 1.0) volumeScore = 8;
  else volumeScore = 4;

  breakdown.volume = volumeScore;
  score += volumeScore;

  reasons.push(
    volumeScore >= 14
      ? "Above-average volume confirms participation"
      : "Volume participation is average or low"
  );

  /* ===========================
     4️⃣ FIBONACCI PIVOTS (20%)
     =========================== */
  const pivots = fibonacciPivots(
    bars.slice(-2)[0].close, // Extract the 'close' property from the Bar object
    bars.slice(-3)[0].close, // Extract the 'close' property from the Bar object
    bars.slice(-4)[0].close  // Extract the 'close' property from the Bar object
  );

  const distanceFromPP =
    ((last.close - pivots.pp) / pivots.pp) * 100;

  let fibScore = 0;
  if (distanceFromPP > 1) fibScore = 20;
  else if (distanceFromPP > 0) fibScore = 14;
  else if (distanceFromPP > -1) fibScore = 8;
  else fibScore = 4;

  breakdown.fibonacci = fibScore;
  score += fibScore;

  reasons.push(
    fibScore >= 14
      ? "Price is holding above key Fibonacci structure"
      : "Price is near or below Fibonacci pivot"
  );

  /* ===========================
     FINAL BIAS
     =========================== */
  let bias: ConfidenceBias = "Neutral";
  if (score >= 75) bias = "Bullish";
  else if (score <= 45) bias = "Bearish";
  else if (score <= 74) bias = "Neutral to Bullish";
  else if (score >= 46) bias = "Neutral to Bearish";
  

  return {
    score: Math.round(score),
    bias,
    breakdown,
    reasons,
  };
}
