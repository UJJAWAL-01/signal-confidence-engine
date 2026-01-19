import {
  computeConfidence,
  score ,
  ConfidenceBias,
} from "./confidenceEngine";

type TFInput = Parameters<typeof computeConfidence>[0];

export type MultiTFConfidence = score & {
  daily: score;
  weekly: score;
  confluenceReasons: string[];
};

export function computeMultiTFConfidence(
  daily: TFInput,
  weekly: TFInput
): MultiTFConfidence {
  const dailyResult = { 
    ...computeConfidence(daily), 
    bias: computeConfidence(daily).bias as ConfidenceBias,
    breakdown: {
      trend: computeConfidence(daily).breakdown.trend ?? 0,
      momentum: computeConfidence(daily).breakdown.momentum ?? 0,
      // breakout: computeConfidence(daily).breakdown.breakout ?? 0,
      volume: computeConfidence(daily).breakdown.volume ?? 0,
      fibonacci: computeConfidence(daily).breakdown.fibonacci ?? 0,
    }
  };
  const weeklyResult = { 
    ...computeConfidence(weekly), 
    bias: computeConfidence(weekly).bias as ConfidenceBias,
    breakdown: {
      trend: computeConfidence(weekly).breakdown.trend ?? 0,
      momentum: computeConfidence(weekly).breakdown.momentum ?? 0,
      // breakout: computeConfidence(weekly).breakdown.breakout ?? 0,
      volume: computeConfidence(weekly).breakdown.volume ?? 0,
      fibonacci: computeConfidence(weekly).breakdown.fibonacci ?? 0,
    }
  };

  const score = Math.round(
    dailyResult.score * 0.4 + weeklyResult.score * 0.6
  );

  let bias: ConfidenceBias = "Neutral";
  if (score >= 65) bias = "Bullish";
  else if (score <= 35) bias = "Bearish";

  const confluenceReasons: string[] = [];

  if (dailyResult.bias === weeklyResult.bias) {
    confluenceReasons.push(
      `Daily & Weekly aligned (${weeklyResult.bias})`
    );
  } else {
    confluenceReasons.push(
      `Daily (${dailyResult.bias}) vs Weekly (${weeklyResult.bias}) divergence`
    );
  }

  return {
    ...dailyResult, // UI continues to work
    score,
    bias,
    daily: dailyResult,
    weekly: weeklyResult,
    reasons: [...dailyResult.reasons, ...confluenceReasons],
    confluenceReasons,
  };
}
