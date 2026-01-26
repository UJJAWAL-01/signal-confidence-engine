// ============================================
// PROFESSIONAL SIGNAL CONFIDENCE ENGINE
// Multi-Layer Technical Analysis System
// ============================================

export type Bar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
};

export type ConfidenceResult = {
  finalScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  bias: 'Bullish' | 'Bearish' | 'Neutral' | 'Neutral to Bullish' | 'Neutral to Bearish';
  confidence: string;
  layers: {
    trend: LayerResult;
    momentum: LayerResult;
    structure: LayerResult;
    volatility: LayerResult;
  };
  timeframes: TimeframeAnalysis;
  keyLevels: KeyLevels;
  risks: Risk[];
  opportunities: Opportunity[];
};

export type LayerResult = {
  score: number;
  components: Component[];
};

export type Component = {
  name: string;
  value: number;
  signal: 'Bullish' | 'Bearish' | 'Neutral' | 'Moderate' | 'Expanding';
  description: string;
};

export type TimeframeAnalysis = {
  daily: { score: number; bias: string; trend: string };
  weekly: { score: number; bias: string; trend: string };
  monthly: { score: number; bias: string; trend: string };
};

export type KeyLevels = {
  resistance: number[];
  support: number[];
};

export type Risk = {
  level: 'Low' | 'Medium' | 'High';
  description: string;
};

export type Opportunity = {
  probability: 'Low' | 'Medium' | 'High';
  description: string;
};

// ============================================
// CORE TECHNICAL INDICATORS
// ============================================

function simpleMovingAverage(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i + 1 < period) {
      result.push(null);
      continue;
    }
    const slice = values.slice(i + 1 - period, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    result.push(avg);
  }
  return result;
}

function exponentialMovingAverage(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  // Calculate SMA for first EMA value
  const firstSMA = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < period - 1; i++) {
    result.push(null);
  }
  
  let ema = firstSMA;
  result.push(ema);
  
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
}

function rsi(values: number[], period = 14): number[] {
  const result: number[] = [];
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    
    if (i <= period) {
      if (diff >= 0) gains += diff;
      else losses -= diff;
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
    result.push(rsiValue);
  }
  
  return result;
}

function averageTrueRange(bars: Bar[], period = 14): number[] {
  const result: number[] = [];
  const trueRanges: number[] = [];
  
  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(atr);
  
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push(atr);
  }
  
  return result;
}

function adx(bars: Bar[], period = 14): number {
  const atr = averageTrueRange(bars, period);
  
  let plusDM = 0;
  let minusDM = 0;
  
  for (let i = bars.length - period; i < bars.length - 1; i++) {
    const upMove = bars[i + 1].high - bars[i].high;
    const downMove = bars[i].low - bars[i + 1].low;
    
    if (upMove > downMove && upMove > 0) plusDM += upMove;
    if (downMove > upMove && downMove > 0) minusDM += downMove;
  }
  
  const avgATR = atr[atr.length - 1] || 1;
  const plusDI = (plusDM / (period * avgATR)) * 100;
  const minusDI = (minusDM / (period * avgATR)) * 100;
  
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
  return Math.min(dx, 100);
}

function bollingerBands(values: number[], period = 20, stdDev = 2): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const middle = simpleMovingAverage(values, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (middle[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    
    const slice = values.slice(Math.max(0, i - period + 1), i + 1);
    const mean = middle[i]!;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const sd = Math.sqrt(variance);
    
    upper.push(mean + sd * stdDev);
    lower.push(mean - sd * stdDev);
  }
  
  return { upper, middle, lower };
}

function ichimokuCloud(bars: Bar[]) {
  const tenkanPeriod = 9;
  const kijunPeriod = 26;
  const senkouBPeriod = 52;
  
  const tenkanSen: (number | null)[] = [];
  const kijunSen: (number | null)[] = [];
  const senkouSpanA: (number | null)[] = [];
  const senkouSpanB: (number | null)[] = [];
  
  for (let i = 0; i < bars.length; i++) {
    if (i >= tenkanPeriod - 1) {
      const slice = bars.slice(i - tenkanPeriod + 1, i + 1);
      const high = Math.max(...slice.map(b => b.high));
      const low = Math.min(...slice.map(b => b.low));
      tenkanSen.push((high + low) / 2);
    } else {
      tenkanSen.push(null);
    }
    
    if (i >= kijunPeriod - 1) {
      const slice = bars.slice(i - kijunPeriod + 1, i + 1);
      const high = Math.max(...slice.map(b => b.high));
      const low = Math.min(...slice.map(b => b.low));
      kijunSen.push((high + low) / 2);
    } else {
      kijunSen.push(null);
    }
    
    if (tenkanSen[i] !== null && kijunSen[i] !== null) {
      senkouSpanA.push((tenkanSen[i]! + kijunSen[i]!) / 2);
    } else {
      senkouSpanA.push(null);
    }
    
    if (i >= senkouBPeriod - 1) {
      const slice = bars.slice(i - senkouBPeriod + 1, i + 1);
      const high = Math.max(...slice.map(b => b.high));
      const low = Math.min(...slice.map(b => b.low));
      senkouSpanB.push((high + low) / 2);
    } else {
      senkouSpanB.push(null);
    }
  }
  
  return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB };
}

// ============================================
// LAYER ANALYSIS FUNCTIONS
// ============================================

function analyzeTrend(bars: Bar[], closes: number[]): LayerResult {
  const components: Component[] = [];
  const currentPrice = closes[closes.length - 1];
  
  // Ichimoku Cloud
  const ichimoku = ichimokuCloud(bars);
  const spanA = ichimoku.senkouSpanA[ichimoku.senkouSpanA.length - 1];
  const spanB = ichimoku.senkouSpanB[ichimoku.senkouSpanB.length - 1];
  
  let ichimokuScore = 50;
  let ichimokuSignal: Component['signal'] = 'Neutral';
  let ichimokuDesc = 'Price inside cloud';
  
  if (spanA !== null && spanB !== null) {
    const cloudTop = Math.max(spanA, spanB);
    const cloudBottom = Math.min(spanA, spanB);
    const cloudThickness = Math.abs(spanA - spanB) / currentPrice;
    
    if (currentPrice > cloudTop) {
      ichimokuScore = cloudThickness > 0.02 ? 90 : 75;
      ichimokuSignal = 'Bullish';
      ichimokuDesc = `Price above cloud, ${cloudThickness > 0.02 ? 'thick' : 'moderate'} support`;
    } else if (currentPrice < cloudBottom) {
      ichimokuScore = 25;
      ichimokuSignal = 'Bearish';
      ichimokuDesc = 'Price below cloud';
    }
  }
  
  components.push({
    name: 'Ichimoku Cloud',
    value: ichimokuScore,
    signal: ichimokuSignal,
    description: ichimokuDesc
  });
  
  // EMA Ribbon
  const ema8 = exponentialMovingAverage(closes, 8);
  const ema21 = exponentialMovingAverage(closes, 21);
  const ema55 = exponentialMovingAverage(closes, 55);
  
  const e8 = ema8[ema8.length - 1];
  const e21 = ema21[ema21.length - 1];
  const e55 = ema55[ema55.length - 1];
  
  let emaScore = 50;
  let emaSignal: Component['signal'] = 'Neutral';
  let emaDesc = 'EMAs mixed';
  
  if (e8 !== null && e21 !== null && e55 !== null) {
    if (e8 > e21 && e21 > e55 && currentPrice > e8) {
      emaScore = 85;
      emaSignal = 'Bullish';
      emaDesc = '8/21/55 aligned upward';
    } else if (e8 < e21 && e21 < e55 && currentPrice < e8) {
      emaScore = 20;
      emaSignal = 'Bearish';
      emaDesc = '8/21/55 aligned downward';
    } else if (currentPrice > e21) {
      emaScore = 65;
      emaSignal = 'Bullish';
      emaDesc = 'Price above key EMAs';
    }
  }
  
  components.push({
    name: 'EMA Ribbon',
    value: emaScore,
    signal: emaSignal,
    description: emaDesc
  });
  
  // ADX
  const adxValue = adx(bars, 14);
  let adxScore = 50;
  let adxSignal: Component['signal'] = 'Moderate';
  let adxDesc = `ADX at ${adxValue.toFixed(0)}`;
  
  if (adxValue > 40) {
    adxScore = 90;
    adxSignal = 'Bullish';
    adxDesc += ', very strong trend';
  } else if (adxValue > 25) {
    adxScore = 70;
    adxDesc += ', strengthening';
  } else {
    adxScore = 40;
    adxDesc += ', weak trend';
  }
  
  components.push({
    name: 'ADX Strength',
    value: adxScore,
    signal: adxSignal,
    description: adxDesc
  });
  
  const trendScore = Math.round((ichimokuScore * 0.35 + emaScore * 0.35 + adxScore * 0.30));
  
  return { score: trendScore, components };
}

function analyzeMomentum(bars: Bar[], closes: number[]): LayerResult {
  const components: Component[] = [];
  
  const rsi14 = rsi(closes, 14);
  const currentRSI = rsi14[rsi14.length - 1] || 50;
  
  let rsiScore = 50;
  let rsiSignal: Component['signal'] = 'Neutral';
  let rsiDesc = `RSI at ${currentRSI.toFixed(1)}`;
  
  if (currentRSI > 60 && currentRSI < 70) {
    rsiScore = 75;
    rsiSignal = 'Bullish';
    rsiDesc += ', strong momentum';
  } else if (currentRSI > 70) {
    rsiScore = 55;
    rsiDesc += ', overbought';
  } else if (currentRSI < 30) {
    rsiScore = 70;
    rsiSignal = 'Bullish';
    rsiDesc += ', oversold bounce potential';
  } else if (currentRSI > 40) {
    rsiScore = 60;
    rsiDesc += ', neutral momentum';
  }
  
  components.push({
    name: 'RSI (14)',
    value: rsiScore,
    signal: rsiSignal,
    description: rsiDesc
  });
  
  // MACD
  const ema12 = exponentialMovingAverage(closes, 12);
  const ema26 = exponentialMovingAverage(closes, 26);
  
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macdLine.push(ema12[i]! - ema26[i]!);
    }
  }
  
  const signalLine = exponentialMovingAverage(macdLine, 9);
  const histogram: number[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (signalLine[i] !== null) {
      histogram.push(macdLine[i] - signalLine[i]!);
    }
  }
  
  const currentHist = histogram[histogram.length - 1] || 0;
  const prevHist = histogram[histogram.length - 2] || 0;
  
  let macdScore = 50;
  let macdSignal: Component['signal'] = 'Neutral';
  let macdDesc = '';
  
  if (currentHist > 0 && currentHist > prevHist) {
    macdScore = 80;
    macdSignal = 'Bullish';
    macdDesc = 'Positive and expanding';
  } else if (currentHist > 0) {
    macdScore = 65;
    macdSignal = 'Bullish';
    macdDesc = 'Positive but weakening';
  } else if (currentHist < 0 && currentHist < prevHist) {
    macdScore = 25;
    macdSignal = 'Bearish';
    macdDesc = 'Negative and expanding';
  } else {
    macdScore = 45;
    macdDesc = 'Negative but improving';
  }
  
  components.push({
    name: 'MACD Histogram',
    value: macdScore,
    signal: macdSignal,
    description: macdDesc
  });
  
  const momentumScore = Math.round((rsiScore * 0.50 + macdScore * 0.50));
  
  return { score: momentumScore, components };
}

function analyzeStructure(bars: Bar[], closes: number[]): LayerResult {
  const components: Component[] = [];
  const currentPrice = closes[closes.length - 1];
  const recentBars = bars.slice(-50);
  
  const highestHigh = Math.max(...recentBars.map(b => b.high));
  const lowestLow = Math.min(...recentBars.map(b => b.low));
  
  const distanceFromLow = ((currentPrice - lowestLow) / currentPrice) * 100;
  
  let structureScore = 50;
  let structureSignal: Component['signal'] = 'Neutral';
  let structureDesc = '';
  
  if (distanceFromLow < 5 && currentPrice > closes[closes.length - 5]) {
    structureScore = 85;
    structureSignal = 'Bullish';
    structureDesc = 'Near support, bouncing';
  } else if (distanceFromLow < 15) {
    structureScore = 65;
    structureSignal = 'Bullish';
    structureDesc = 'In lower third of range';
  } else if (distanceFromLow > 85) {
    structureScore = 35;
    structureSignal = 'Bearish';
    structureDesc = 'Near resistance';
  } else {
    structureScore = 50;
    structureDesc = 'Mid-range';
  }
  
  components.push({
    name: 'Price Structure',
    value: structureScore,
    signal: structureSignal,
    description: structureDesc
  });
  
  return { score: structureScore, components };
}

function analyzeVolatility(bars: Bar[], closes: number[]): LayerResult {
  const components: Component[] = [];
  
  const atr = averageTrueRange(bars, 14);
  const currentATR = atr[atr.length - 1] || 0;
  const currentPrice = closes[closes.length - 1];
  const atrPercent = (currentATR / currentPrice) * 100;
  
  let atrScore = 65;
  let atrSignal: Component['signal'] = 'Moderate';
  let atrDesc = `ATR ${atrPercent.toFixed(2)}%, `;
  
  if (atrPercent < 1) {
    atrDesc += 'low volatility';
  } else if (atrPercent < 2) {
    atrDesc += 'normal range';
  } else {
    atrDesc += 'elevated';
  }
  
  components.push({
    name: 'ATR Analysis',
    value: atrScore,
    signal: atrSignal,
    description: atrDesc
  });
  
  return { score: atrScore, components };
}

function calculateKeyLevels(bars: Bar[]): KeyLevels {
  const recentBars = bars.slice(-100);
  const currentPrice = bars[bars.length - 1].close;
  
  const pivotHighs: number[] = [];
  for (let i = 5; i < recentBars.length - 5; i++) {
    if (recentBars[i].high > recentBars[i-1].high &&
        recentBars[i].high > recentBars[i-2].high &&
        recentBars[i].high > recentBars[i+1].high &&
        recentBars[i].high > recentBars[i+2].high) {
      pivotHighs.push(recentBars[i].high);
    }
  }
  
  const pivotLows: number[] = [];
  for (let i = 5; i < recentBars.length - 5; i++) {
    if (recentBars[i].low < recentBars[i-1].low &&
        recentBars[i].low < recentBars[i-2].low &&
        recentBars[i].low < recentBars[i+1].low &&
        recentBars[i].low < recentBars[i+2].low) {
      pivotLows.push(recentBars[i].low);
    }
  }
  
  const resistance = pivotHighs
    .filter(h => h > currentPrice)
    .sort((a, b) => a - b)
    .slice(0, 3);
  
  const support = pivotLows
    .filter(l => l < currentPrice)
    .sort((a, b) => b - a)
    .slice(0, 3);
  
  return { resistance, support };
}

export function computeAdvancedConfidence(
  dailyBars: Bar[],
  weeklyBars: Bar[],
  monthlyBars: Bar[]
): ConfidenceResult {
  const analyzeTimeframe = (bars: Bar[]) => {
    const closes = bars.map(b => b.close);
    const trend = analyzeTrend(bars, closes);
    const momentum = analyzeMomentum(bars, closes);
    const structure = analyzeStructure(bars, closes);
    const volatility = analyzeVolatility(bars, closes);
    
    const score = Math.round(
      trend.score * 0.30 +
      momentum.score * 0.25 +
      structure.score * 0.25 +
      volatility.score * 0.20
    );
    
    let bias = 'Neutral';
    if (score >= 75) bias = 'Bullish';
    else if (score >= 60) bias = 'Neutral to Bullish';
    else if (score <= 45) bias = 'Bearish';
    else if (score <= 60) bias = 'Neutral to Bearish';
    
    let trendDesc = 'Ranging';
    if (trend.score >= 70) trendDesc = 'Strong Up';
    else if (trend.score >= 55) trendDesc = 'Up';
    else if (trend.score <= 40) trendDesc = 'Down';
    
    return { score, bias, trend: trendDesc, layers: { trend, momentum, structure, volatility } };
  };
  
  const daily = analyzeTimeframe(dailyBars);
  const weekly = analyzeTimeframe(weeklyBars);
  const monthly = analyzeTimeframe(monthlyBars);
  
  const finalScore = Math.round(
    daily.score * 0.40 +
    weekly.score * 0.35 +
    monthly.score * 0.25
  );
  
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (finalScore >= 90) grade = 'A+';
  else if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 60) grade = 'C';
  else grade = 'D';
  
  let bias: ConfidenceResult['bias'] = 'Neutral';
  if (finalScore >= 75) bias = 'Bullish';
  else if (finalScore >= 60) bias = 'Neutral to Bullish';
  else if (finalScore <= 45) bias = 'Bearish';
  else if (finalScore <= 60) bias = 'Neutral to Bearish';
  
  let confidence = 'Low';
  if (finalScore >= 80) confidence = 'Very High';
  else if (finalScore >= 70) confidence = 'High';
  else if (finalScore >= 60) confidence = 'Medium-High';
  else if (finalScore >= 50) confidence = 'Medium';
  
  const keyLevels = calculateKeyLevels(dailyBars);
  
  const risks: Risk[] = [];
  const opportunities: Opportunity[] = [];
  
  if (keyLevels.support.length > 0 && finalScore >= 60) {
    opportunities.push({
      probability: 'High',
      description: `Pullback to $${keyLevels.support[0].toFixed(2)} support offers entry`
    });
  }
  
  if (keyLevels.resistance.length > 0 && daily.layers.momentum.score >= 65) {
    opportunities.push({
      probability: 'Medium',
      description: `Breakout above $${keyLevels.resistance[0].toFixed(2)} confirms continuation`
    });
  }
  
  if (daily.score > 70 && weekly.score < 55) {
    risks.push({
      level: 'Medium',
      description: 'Daily strength not confirmed by weekly timeframe'
    });
  }
  
  return {
    finalScore,
    grade,
    bias,
    confidence,
    layers: daily.layers,
    timeframes: {
      daily: { score: daily.score, bias: daily.bias, trend: daily.trend },
      weekly: { score: weekly.score, bias: weekly.bias, trend: weekly.trend },
      monthly: { score: monthly.score, bias: monthly.bias, trend: monthly.trend }
    },
    keyLevels,
    risks,
    opportunities
  };
}