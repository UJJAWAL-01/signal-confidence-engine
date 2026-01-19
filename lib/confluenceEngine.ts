import { ConfidenceResult, Bias } from "./confidenceEngine";

export function computeConfluence(
  daily: ConfidenceResult,
  weekly?: ConfidenceResult
): { score: number; bias: Bias } {
  if (!weekly || !weekly.valid) {
    return { score: daily.score, bias: daily.bias };
  }

  const score = Math.round(daily.score * 0.6 + weekly.score * 0.4);
  const bias: Bias =
    score >= 65 ? "Bullish" : score <= 35 ? "Bearish" : "Neutral";

  return { score, bias };
}
