"use client";

type Props = {
  score: number;
  bias: "Bullish" | "Bearish" | "Neutral";
};

export default function ConfidenceGauge({ score, bias }: Props) {
  const color =
    bias === "Bullish"
      ? "text-green-600"
      : bias === "Bearish"
      ? "text-red-600"
      : "text-gray-700";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Signal Confidence
      </h3>

      <div className={`text-6xl font-bold mt-2 ${color}`}>
        {score}%
      </div>

      <div className={`mt-2 text-lg font-medium ${color}`}>
        {bias}
      </div>
    </div>
  );
}
