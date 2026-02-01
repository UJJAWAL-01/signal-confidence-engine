// ============================================
// ADVANCED INSTITUTIONAL ANALYSIS ENGINE
// ML-Inspired Technical Analysis with Statistical Models
// ============================================

export type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type InstitutionalAnalysis = {
  orderFlow: OrderFlowAnalysis;
  marketMicrostructure: MarketMicrostructure;
  regimeDetection: RegimeDetection;
  volatilitySurface: VolatilitySurface;
  liquidityAnalysis: LiquidityAnalysis;
  smartMoneyIndicators: SmartMoneyIndicators;
  correlationMatrix: CorrelationMatrix;
  seasonalityPatterns: SeasonalityPatterns;
};

export type OrderFlowAnalysis = {
  score: number;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  components: {
    name: string;
    value: number;
    description: string;
    interpretation: string;
  }[];
  summary: string;
};

export type MarketMicrostructure = {
  score: number;
  bidAskSpread: number;
  marketDepth: number;
  priceImpact: number;
  informationAsymmetry: number;
  description: string;
};

export type RegimeDetection = {
  currentRegime: 'TRENDING' | 'MEAN_REVERTING' | 'VOLATILE' | 'QUIET';
  confidence: number;
  trendStrength: number;
  meanReversionScore: number;
  volatilityRegime: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  recommendations: string[];
};

export type VolatilitySurface = {
  realizedVol: number;
  impliedVol: number;
  volOfVol: number;
  skew: number;
  term: string;
  components: {
    name: string;
    value: number;
    interpretation: string;
  }[];
};

export type LiquidityAnalysis = {
  score: number;
  amihudIlliquidity: number;
  volumeProfile: {
    highVolume: number[];
    lowVolume: number[];
    poc: number; // Point of Control
  };
  liquidityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
};

export type SmartMoneyIndicators = {
  score: number;
  signal: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
  components: {
    wyckoffPhase: string;
    compositeIndex: number;
    institutionalActivity: number;
    darkPoolActivity: number;
  };
  description: string;
};

export type CorrelationMatrix = {
  marketCorrelation: number;
  sectorCorrelation: number;
  betaStability: number;
  description: string;
};

export type SeasonalityPatterns = {
  dayOfWeek: { [key: string]: number };
  monthlyTrend: number;
  quarterlyPattern: string;
  description: string;
};

// ============================================
// STATISTICAL UTILITIES
// ============================================

function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

function covariance(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const xSlice = x.slice(-n);
  const ySlice = y.slice(-n);
  const xMean = mean(xSlice);
  const yMean = mean(ySlice);
  
  let cov = 0;
  for (let i = 0; i < n; i++) {
    cov += (xSlice[i] - xMean) * (ySlice[i] - yMean);
  }
  return cov / n;
}

function correlation(x: number[], y: number[]): number {
  const cov = covariance(x, y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);
  return cov / (stdX * stdY);
}

function autocorrelation(values: number[], lag: number): number {
  if (lag >= values.length) return 0;
  const x = values.slice(0, -lag);
  const y = values.slice(lag);
  return correlation(x, y);
}

function skewness(values: number[]): number {
  const n = values.length;
  const avg = mean(values);
  const std = standardDeviation(values);
  
  const cubedDiffs = values.map(val => Math.pow((val - avg) / std, 3));
  return (n / ((n - 1) * (n - 2))) * cubedDiffs.reduce((sum, val) => sum + val, 0);
}

function kurtosis(values: number[]): number {
  const n = values.length;
  const avg = mean(values);
  const std = standardDeviation(values);
  
  const fourthDiffs = values.map(val => Math.pow((val - avg) / std, 4));
  const kurt = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * 
               fourthDiffs.reduce((sum, val) => sum + val, 0);
  const correction = 3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3));
  return kurt - correction;
}

// ============================================
// ORDER FLOW ANALYSIS
// ============================================

function analyzeOrderFlow(bars: Bar[]): OrderFlowAnalysis {
  const components: OrderFlowAnalysis['components'] = [];
  const closes = bars.map(b => b.close);
  const volumes = bars.map(b => b.volume);
  
  // Volume-Weighted Average Price (VWAP) Distance
  let cumulativeVWAP = 0;
  let cumulativeVolume = 0;
  const recentBars = bars.slice(-20);
  
  recentBars.forEach(bar => {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    cumulativeVWAP += typicalPrice * bar.volume;
    cumulativeVolume += bar.volume;
  });
  
  const vwap = cumulativeVWAP / cumulativeVolume;
  const currentPrice = closes[closes.length - 1];
  const vwapDistance = ((currentPrice - vwap) / vwap) * 100;
  
  let vwapScore = 50;
  if (vwapDistance > 1) vwapScore = 75;
  else if (vwapDistance > 0.5) vwapScore = 65;
  else if (vwapDistance < -1) vwapScore = 30;
  
  components.push({
    name: 'VWMA Position',
    value: vwapScore,
    description: `Price is ${vwapDistance > 0 ? 'above' : 'below'} VWMA by ${Math.abs(vwapDistance).toFixed(2)}%`,
    interpretation: vwapDistance > 1 ? 
      'Strong buying pressure - institutional accumulation likely' :
      vwapDistance < -1 ?
      'Selling pressure dominant - potential distribution' :
      'Price near fair value - balanced order flow'
  });
  
  // Volume Delta Analysis
  const volumeDeltas: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const priceChange = bars[i].close - bars[i].open;
    const delta = priceChange > 0 ? bars[i].volume : -bars[i].volume;
    volumeDeltas.push(delta);
  }
  
  const recentDeltas = volumeDeltas.slice(-20);
  const cumulativeDelta = recentDeltas.reduce((sum, d) => sum + d, 0);
  const avgVolume = mean(volumes.slice(-20));
  const deltaScore = (cumulativeDelta / (avgVolume * 20)) * 100;
  
  let deltaScoreNormalized = 50 + (deltaScore * 50);
  deltaScoreNormalized = Math.max(0, Math.min(100, deltaScoreNormalized));
  
  components.push({
    name: 'Cumulative Volume Delta',
    value: Math.round(deltaScoreNormalized),
    description: `${cumulativeDelta > 0 ? 'Positive' : 'Negative'} delta of ${(Math.abs(deltaScore)).toFixed(1)}%`,
    interpretation: cumulativeDelta > avgVolume ?
      'Strong net buying - aggressive buy orders overwhelming supply' :
      cumulativeDelta < -avgVolume ?
      'Strong net selling - supply exceeding demand' :
      'Balanced order flow - neutral market sentiment'
  });
  
  // Order Flow Imbalance
  const buyVolume = bars.slice(-20).reduce((sum, bar) => {
    return sum + (bar.close > bar.open ? bar.volume : 0);
  }, 0);
  
  const sellVolume = bars.slice(-20).reduce((sum, bar) => {
    return sum + (bar.close < bar.open ? bar.volume : 0);
  }, 0);
  
  const totalVolume = buyVolume + sellVolume;
  const imbalance = ((buyVolume - sellVolume) / totalVolume) * 100;
  
  let imbalanceScore = 50 + imbalance;
  imbalanceScore = Math.max(0, Math.min(100, imbalanceScore));
  
  components.push({
    name: 'Order Flow Imbalance',
    value: Math.round(imbalanceScore),
    description: `${imbalance > 0 ? 'Buy' : 'Sell'} side dominance of ${Math.abs(imbalance).toFixed(1)}%`,
    interpretation: Math.abs(imbalance) > 20 ?
      `Very strong ${imbalance > 0 ? 'buying' : 'selling'} pressure - one-sided order flow` :
      Math.abs(imbalance) > 10 ?
      `Moderate ${imbalance > 0 ? 'buying' : 'selling'} bias` :
      'Balanced two-way order flow'
  });
  
  const finalScore = Math.round(mean(components.map(c => c.value)));
  
  let signal: OrderFlowAnalysis['signal'] = 'NEUTRAL';
  if (finalScore >= 65) signal = 'BULLISH';
  else if (finalScore <= 40) signal = 'BEARISH';
  
  return {
    score: finalScore,
    signal,
    components,
    summary: signal === 'BULLISH' ?
      'Institutional order flow shows strong accumulation patterns with buy-side dominance' :
      signal === 'BEARISH' ?
      'Distribution pattern detected with persistent sell-side pressure' :
      'Neutral order flow with balanced institutional activity'
  };
}

// ============================================
// MARKET MICROSTRUCTURE
// ============================================

function analyzeMarketMicrostructure(bars: Bar[]): MarketMicrostructure {
  const closes = bars.map(b => b.close);
  const volumes = bars.map(b => b.volume);
  const returns = closes.slice(1).map((price, i) => (price - closes[i]) / closes[i]);
  
  // Bid-Ask Spread Proxy (using high-low range as proxy)
  const recentBars = bars.slice(-20);
  const avgSpread = mean(recentBars.map(b => ((b.high - b.low) / b.close) * 100));
  
  // Market Depth (volume concentration)
  const volumeStd = standardDeviation(volumes.slice(-20));
  const avgVol = mean(volumes.slice(-20));
  const depthScore = (volumeStd / avgVol) * 100;
  
  // Price Impact (Amihud Illiquidity)
  const priceImpacts = returns.slice(-20).map((ret, i) => {
    const vol = volumes.slice(-20)[i];
    return Math.abs(ret) / (vol / 1000000); // Normalized
  });
  const avgPriceImpact = mean(priceImpacts);
  
  // Information Asymmetry (using return autocorrelation)
  const autoCorr1 = autocorrelation(returns.slice(-60), 1);
  const infoAsymmetry = Math.abs(autoCorr1) * 100;
  
  const microScore = Math.round(
    100 - (avgSpread * 10) - (depthScore * 0.5) - (avgPriceImpact * 20) - (infoAsymmetry * 0.5)
  );
  
  return {
    score: Math.max(0, Math.min(100, microScore)),
    bidAskSpread: Number(avgSpread.toFixed(3)),
    marketDepth: Number(depthScore.toFixed(2)),
    priceImpact: Number(avgPriceImpact.toFixed(4)),
    informationAsymmetry: Number(infoAsymmetry.toFixed(2)),
    description: microScore > 70 ?
      'Excellent market microstructure with tight spreads and deep liquidity' :
      microScore > 50 ?
      'Good microstructure - normal trading conditions' :
      'Challenged microstructure - wider spreads or lower liquidity'
  };
}

// ============================================
// REGIME DETECTION
// ============================================

function detectMarketRegime(bars: Bar[], marketBars: Bar[]): RegimeDetection {
  const closes = bars.map(b => b.close);
  const returns = closes.slice(1).map((price, i) => (price - closes[i]) / closes[i]);
  
  // Trend Strength (using ADX-like calculation)
  const recentReturns = returns.slice(-20);
  const positiveSum = recentReturns.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
  const negativeSum = Math.abs(recentReturns.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
  const trendStrength = Math.abs(positiveSum - negativeSum) / (positiveSum + negativeSum) * 100;
  
  // Mean Reversion Score (using autocorrelation)
  const autoCorr = autocorrelation(returns.slice(-40), 1);
  const meanReversionScore = (-autoCorr + 1) * 50; // Negative autocorr = mean reversion
  
  // Volatility Regime
  const vol20 = standardDeviation(returns.slice(-20)) * Math.sqrt(252) * 100;
  const vol60 = standardDeviation(returns.slice(-60)) * Math.sqrt(252) * 100;
  
  let volatilityRegime: RegimeDetection['volatilityRegime'] = 'MEDIUM';
  if (vol20 > vol60 * 1.5) volatilityRegime = 'HIGH';
  else if (vol20 < vol60 * 0.7) volatilityRegime = 'LOW';
  
  // Determine Current Regime
  let currentRegime: RegimeDetection['currentRegime'] = 'MEAN_REVERTING';
  let confidence = 50;
  
  if (trendStrength > 60 && volatilityRegime !== 'HIGH') {
    currentRegime = 'TRENDING';
    confidence = Math.min(90, 50 + trendStrength / 2);
  } else if (meanReversionScore > 60 && volatilityRegime === 'LOW') {
    currentRegime = 'MEAN_REVERTING';
    confidence = Math.min(85, 50 + meanReversionScore / 3);
  } else if (volatilityRegime === 'HIGH') {
    currentRegime = 'VOLATILE';
    confidence = 75;
  } else if (volatilityRegime === 'LOW' && trendStrength < 30) {
    currentRegime = 'QUIET';
    confidence = 70;
  }
  
  const recommendations: string[] = [];
  if (currentRegime === 'TRENDING') {
    recommendations.push('Trend-following strategies optimal');
    recommendations.push('Use momentum indicators and moving average systems');
    recommendations.push('Wider stops to avoid noise');
  } else if (currentRegime === 'MEAN_REVERTING') {
    recommendations.push('Range-bound strategies preferred');
    recommendations.push('Use oscillators (RSI, Stochastic)');
    recommendations.push('Fade extremes, take profits quickly');
  } else if (currentRegime === 'VOLATILE') {
    recommendations.push('Reduce position sizes');
    recommendations.push('Widen stops or use time-based exits');
    recommendations.push('Consider options strategies');
  } else {
    recommendations.push('Low volatility - good for accumulation');
    recommendations.push('Tight stops acceptable');
    recommendations.push('Watch for breakout setups');
  }
  
  return {
    currentRegime,
    confidence: Math.round(confidence),
    trendStrength: Math.round(trendStrength),
    meanReversionScore: Math.round(meanReversionScore),
    volatilityRegime,
    description: `Market is in ${currentRegime.replace('_', ' ').toLowerCase()} regime with ${confidence.toFixed(0)}% confidence`,
    recommendations
  };
}

// ============================================
// VOLATILITY SURFACE ANALYSIS
// ============================================

function analyzeVolatilitySurface(bars: Bar[]): VolatilitySurface {
  const closes = bars.map(b => b.close);
  const returns = closes.slice(1).map((price, i) => (price - closes[i]) / closes[i]);
  
  // Realized Volatility (different periods)
  const vol10 = standardDeviation(returns.slice(-10)) * Math.sqrt(252) * 100;
  const vol20 = standardDeviation(returns.slice(-20)) * Math.sqrt(252) * 100;
  const vol60 = standardDeviation(returns.slice(-60)) * Math.sqrt(252) * 100;
  
  const realizedVol = vol20;
  
  // Implied Vol Proxy (using ATR-based calculation)
  const atr = bars.slice(-14).map(b => b.high - b.low);
  const avgATR = mean(atr);
  const currentPrice = closes[closes.length - 1];
  const impliedVol = (avgATR / currentPrice) * Math.sqrt(252) * 100;
  
  // Volatility of Volatility
  const volSeries = [vol10, vol20, vol60];
  const volOfVol = standardDeviation(volSeries);
  
  // Volatility Skew (using return skewness as proxy)
  const skew = skewness(returns.slice(-60));
  
  const components = [
    {
      name: '10-Day Realized Vol',
      value: Number(vol10.toFixed(2)),
      interpretation: vol10 > vol20 ? 'Rising short-term volatility' : 'Declining short-term volatility'
    },
    {
      name: '20-Day Realized Vol',
      value: Number(vol20.toFixed(2)),
      interpretation: 'Current volatility baseline'
    },
    {
      name: '60-Day Realized Vol',
      value: Number(vol60.toFixed(2)),
      interpretation: vol60 > vol20 ? 'Volatility declining from highs' : 'Volatility rising from lows'
    },
    {
      name: 'Vol Skew',
      value: Number((skew * 10).toFixed(2)),
      interpretation: skew < -0.5 ?
        'Negative skew - puts more expensive (fear premium)' :
        skew > 0.5 ?
        'Positive skew - calls more expensive (greed premium)' :
        'Balanced skew - neutral sentiment'
    }
  ];
  
  return {
    realizedVol: Number(realizedVol.toFixed(2)),
    impliedVol: Number(impliedVol.toFixed(2)),
    volOfVol: Number(volOfVol.toFixed(2)),
    skew: Number(skew.toFixed(3)),
    term: '20-day',
    components
  };
}

// ============================================
// LIQUIDITY ANALYSIS
// ============================================

function analyzeLiquidity(bars: Bar[]): LiquidityAnalysis {
  const closes = bars.map(b => b.close);
  const volumes = bars.map(b => b.volume);
  const returns = closes.slice(1).map((price, i) => Math.abs((price - closes[i]) / closes[i]));
  
  // Amihud Illiquidity Measure
  const illiquidityScores = returns.map((ret, i) => {
    return ret / (volumes[i + 1] / 1000000);
  });
  const amihudIlliquidity = mean(illiquidityScores.slice(-20));
  
  // Volume Profile Analysis
  const priceRange = Math.max(...closes.slice(-60)) - Math.min(...closes.slice(-60));
  const buckets = 20;
  const bucketSize = priceRange / buckets;
  const minPrice = Math.min(...closes.slice(-60));
  
  const volumeProfile: { [key: number]: number } = {};
  bars.slice(-60).forEach(bar => {
    const bucket = Math.floor((bar.close - minPrice) / bucketSize);
    volumeProfile[bucket] = (volumeProfile[bucket] || 0) + bar.volume;
  });
  
  const sortedBuckets = Object.entries(volumeProfile).sort((a, b) => b[1] - a[1]);
  const pocBucket = parseInt(sortedBuckets[0][0]);
  const poc = minPrice + (pocBucket * bucketSize);
  
  const highVolumeLevels = sortedBuckets.slice(0, 3).map(([bucket]) => 
    minPrice + (parseInt(bucket) * bucketSize)
  );
  
  const lowVolumeLevels = sortedBuckets.slice(-3).map(([bucket]) => 
    minPrice + (parseInt(bucket) * bucketSize)
  );
  
  // Liquidity Score
  const avgVolume = mean(volumes.slice(-20));
  const volumeConsistency = 1 - (standardDeviation(volumes.slice(-20)) / avgVolume);
  const liquidityScore = Math.round((1 - amihudIlliquidity * 100) * 50 + volumeConsistency * 50);
  
  let liquidityRisk: LiquidityAnalysis['liquidityRisk'] = 'MEDIUM';
  if (liquidityScore > 70) liquidityRisk = 'LOW';
  else if (liquidityScore < 40) liquidityRisk = 'HIGH';
  
  return {
    score: Math.max(0, Math.min(100, liquidityScore)),
    amihudIlliquidity: Number(amihudIlliquidity.toFixed(6)),
    volumeProfile: {
      highVolume: highVolumeLevels,
      lowVolume: lowVolumeLevels,
      poc: Number(poc.toFixed(2))
    },
    liquidityRisk,
    description: liquidityRisk === 'LOW' ?
      'Excellent liquidity - minimal slippage expected' :
      liquidityRisk === 'MEDIUM' ?
      'Adequate liquidity - moderate slippage possible on large orders' :
      'Poor liquidity - significant slippage risk'
  };
}

// ============================================
// SMART MONEY INDICATORS
// ============================================

function analyzeSmartMoney(bars: Bar[]): SmartMoneyIndicators {
  const closes = bars.map(b => b.close);
  const volumes = bars.map(b => b.volume);
  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  
  // Wyckoff Phase Detection
  const recentBars = bars.slice(-40);
  const priceVolatility = standardDeviation(closes.slice(-40));
  const volumeTrend = volumes.slice(-20).reduce((sum, v, i, arr) => sum + (i > 0 ? v - arr[i-1] : 0), 0);
  
  let wyckoffPhase = 'Markup';
  const currentPrice = closes[closes.length - 1];
  const highPrice = Math.max(...closes.slice(-40));
  const lowPrice = Math.min(...closes.slice(-40));
  
  if (currentPrice < lowPrice * 1.05 && volumeTrend > 0) {
    wyckoffPhase = 'Accumulation';
  } else if (currentPrice > highPrice * 0.95 && volumeTrend > 0) {
    wyckoffPhase = 'Distribution';
  } else if (currentPrice > lowPrice * 1.2 && priceVolatility < mean(closes.slice(-40)) * 0.05) {
    wyckoffPhase = 'Markup';
  } else {
    wyckoffPhase = 'Markdown';
  }
  
  // Composite Index (Money Flow Index)
  const typicalPrices = bars.slice(-20).map(b => (b.high + b.low + b.close) / 3);
  const rawMoneyFlow = typicalPrices.map((price, i) => price * volumes.slice(-20)[i]);
  
  let positiveFlow = 0;
  let negativeFlow = 0;
  
  for (let i = 1; i < typicalPrices.length; i++) {
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveFlow += rawMoneyFlow[i];
    } else {
      negativeFlow += rawMoneyFlow[i];
    }
  }
  
  const moneyRatio = positiveFlow / negativeFlow;
  const compositeIndex = 100 - (100 / (1 + moneyRatio));
  
  // Institutional Activity (large volume bars)
  const avgVolume = mean(volumes.slice(-60));
  const largeVolumeBars = bars.slice(-20).filter(b => b.volume > avgVolume * 1.5).length;
  const institutionalActivity = (largeVolumeBars / 20) * 100;
  
  // Dark Pool Activity Proxy (gap analysis)
  const gaps = bars.slice(-20, -1).map((bar, i) => {
    const nextBar = bars.slice(-20)[i + 1];
    return Math.abs(nextBar.open - bar.close) / bar.close;
  });
  const darkPoolActivity = mean(gaps) * 100;
  
  const smartMoneyScore = Math.round(
    compositeIndex * 0.4 +
    institutionalActivity * 0.3 +
    (wyckoffPhase === 'Accumulation' || wyckoffPhase === 'Markup' ? 70 : 30) * 0.3
  );
  
  let signal: SmartMoneyIndicators['signal'] = 'NEUTRAL';
  if (wyckoffPhase === 'Accumulation' || (compositeIndex > 60 && institutionalActivity > 30)) {
    signal = 'ACCUMULATION';
  } else if (wyckoffPhase === 'Distribution' || (compositeIndex < 40 && institutionalActivity > 30)) {
    signal = 'DISTRIBUTION';
  }
  
  return {
    score: smartMoneyScore,
    signal,
    components: {
      wyckoffPhase,
      compositeIndex: Math.round(compositeIndex),
      institutionalActivity: Math.round(institutionalActivity),
      darkPoolActivity: Number(darkPoolActivity.toFixed(2))
    },
    description: signal === 'ACCUMULATION' ?
      `Smart money accumulation detected (${wyckoffPhase} phase)` :
      signal === 'DISTRIBUTION' ?
      `Institutional distribution pattern (${wyckoffPhase} phase)` :
      'Neutral institutional positioning'
  };
}

// ============================================
// CORRELATION ANALYSIS
// ============================================

function analyzeCorrelations(bars: Bar[], marketBars: Bar[]): CorrelationMatrix {
  const closes = bars.map(b => b.close);
  const marketCloses = marketBars.map(b => b.close);
  
  const returns = closes.slice(1).map((price, i) => (price - closes[i]) / closes[i]);
  const marketReturns = marketCloses.slice(1).map((price, i) => (price - marketCloses[i]) / marketCloses[i]);
  
  // Market Correlation
  const marketCorr = correlation(returns.slice(-60), marketReturns.slice(-60));
  
  // Sector Correlation (using market as proxy)
  const sectorCorr = correlation(returns.slice(-120), marketReturns.slice(-120));
  
  // Beta Stability (rolling beta calculation)
  const window = 20;
  const rollingBetas: number[] = [];
  
  for (let i = window; i < Math.min(returns.length, marketReturns.length); i++) {
    const stockWindow = returns.slice(i - window, i);
    const marketWindow = marketReturns.slice(i - window, i);
    const cov = covariance(stockWindow, marketWindow);
    const marketVar = Math.pow(standardDeviation(marketWindow), 2);
    rollingBetas.push(cov / marketVar);
  }
  
  const betaStability = 1 - (standardDeviation(rollingBetas) / mean(rollingBetas.map(Math.abs)));
  
  return {
    marketCorrelation: Number(marketCorr.toFixed(3)),
    sectorCorrelation: Number(sectorCorr.toFixed(3)),
    betaStability: Number(betaStability.toFixed(3)),
    description: Math.abs(marketCorr) > 0.7 ?
      'Strong market correlation - moves with overall market' :
      Math.abs(marketCorr) < 0.3 ?
      'Low market correlation - independent behavior' :
      'Moderate market correlation'
  };
}

// ============================================
// SEASONALITY ANALYSIS
// ============================================

function analyzeSeasonality(bars: Bar[]): SeasonalityPatterns {
  const returns = bars.slice(1).map((bar, i) => (bar.close - bars[i].close) / bars[i].close);
  
  // Day of Week Analysis
  const dayReturns: { [key: string]: number[] } = {
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': []
  };
  
  bars.slice(-120).forEach((bar, i) => {
    if (i === 0) return;
    const date = new Date(bar.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const ret = (bar.close - bars.slice(-120)[i - 1].close) / bars.slice(-120)[i - 1].close;
    if (dayReturns[dayName]) {
      dayReturns[dayName].push(ret);
    }
  });
  
  const dayOfWeek: { [key: string]: number } = {};
  Object.keys(dayReturns).forEach(day => {
    if (dayReturns[day].length > 0) {
      dayOfWeek[day] = Number((mean(dayReturns[day]) * 100).toFixed(3));
    }
  });
  
  // Monthly Trend
  const recentMonthlyReturns = returns.slice(-21); // Approx 1 month
  const monthlyTrend = mean(recentMonthlyReturns) * 100;
  
  // Quarterly Pattern
  const q1Returns = returns.slice(-252, -189).length > 0 ? mean(returns.slice(-252, -189)) : 0;
  const q2Returns = returns.slice(-189, -126).length > 0 ? mean(returns.slice(-189, -126)) : 0;
  const q3Returns = returns.slice(-126, -63).length > 0 ? mean(returns.slice(-126, -63)) : 0;
  const q4Returns = returns.slice(-63).length > 0 ? mean(returns.slice(-63)) : 0;
  
  const bestQuarter = [q1Returns, q2Returns, q3Returns, q4Returns].indexOf(Math.max(q1Returns, q2Returns, q3Returns, q4Returns)) + 1;
  
  return {
    dayOfWeek,
    monthlyTrend: Number(monthlyTrend.toFixed(3)),
    quarterlyPattern: `Q${bestQuarter} historically strongest`,
    description: `Monthly trend: ${monthlyTrend > 0 ? 'positive' : 'negative'} ${Math.abs(monthlyTrend).toFixed(2)}%`
  };
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

export function computeAdvancedInstitutionalAnalysis(
  dailyBars: Bar[],
  weeklyBars: Bar[],
  monthlyBars: Bar[],
  marketBars: Bar[]
): InstitutionalAnalysis {
  
  return {
    orderFlow: analyzeOrderFlow(dailyBars),
    marketMicrostructure: analyzeMarketMicrostructure(dailyBars),
    regimeDetection: detectMarketRegime(dailyBars, marketBars),
    volatilitySurface: analyzeVolatilitySurface(dailyBars),
    liquidityAnalysis: analyzeLiquidity(dailyBars),
    smartMoneyIndicators: analyzeSmartMoney(dailyBars),
    correlationMatrix: analyzeCorrelations(dailyBars, marketBars),
    seasonalityPatterns: analyzeSeasonality(dailyBars)
  };
}