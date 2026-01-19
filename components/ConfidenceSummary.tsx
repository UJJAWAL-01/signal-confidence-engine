type Props = {
  label: string;
  score: number;
  bias: "Bullish" | "Neutral" | "Bearish";
};

export default function ConfidenceSummary({
  label,
  score,
  bias,
}: Props) {
  const message =
    bias === "Bullish"
      ? "Conditions favor trend continuation with confirmation."
      : bias === "Bearish"
      ? "Risk outweighs reward under current structure."
      : "Market is indecisive | Selective or wait for confirmation.";

  return (
    <div className="rounded-lg bg-white">
      
      <p className="mt-2 text-sm text-black">
        Score: <b>{score}</b> | {message}
      </p>
    </div>
  );
}
