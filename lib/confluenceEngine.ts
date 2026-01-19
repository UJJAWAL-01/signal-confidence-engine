import { computeConfidence, ConfidenceBias } from "./confidenceEngine";

export function computeConfluence(
  daily: ReturnType<typeof computeConfidence>,
  weekly: ReturnType<typeof computeConfidence>
): { score: number; bias: ConfidenceBias } {
  if (!weekly) {
    return { score: daily.score, bias: daily.bias };
  }

  const score = Math.round(daily.score * 0.6 + weekly.score * 0.4);
  const bias: ConfidenceBias =
    score >= 65 ? "Bullish" : score <= 35 ? "Bearish" : "Neutral";

  return { score, bias };
}
