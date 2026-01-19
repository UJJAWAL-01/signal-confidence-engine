import ConfidenceSummary from "./ConfidenceSummary";

type Props = {
  title: string;
  subtitle: string;
  score: number;
  bias: "Bullish" | "Bearish" | "Neutral" | "Neutral to Bullish"| "Neutral to Bearish";
};

export default function ConfidenceGauge({
  title,
  subtitle,
  score,
  bias,
}: Props) {
  const color =
    bias === "Bullish"
      ? "text-green-600"
      : bias === "Bearish"
      ? "text-red-600"
      : "text-gray-600";

  const confidence = { score, bias }; // Added definition for 'confidence'

  return (
    
    <div className="bg-white p-4 rounded shadow text-center">
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
      <p className="text-xs text-gray-400 mb-2">{subtitle}</p>

      <div className={`text-4xl font-bold ${color}`}>{score}</div>

      <div className={`mt-1 font-medium ${color}`}>{bias}</div>
      <ConfidenceSummary
        label="Daily"
        score={confidence.score}
        bias={confidence.bias}
      />
    </div>
  );
}
