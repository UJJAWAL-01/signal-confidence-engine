type Breakdown = {
  trend: number;
  momentum: number;
};

type Props = {
  breakdown: Breakdown;
  reasons: string[];
};

export default function ConfidenceBreakdown({
  breakdown,
  reasons,
}: Props) {
  return (
    <div className="bg-white p-4 rounded shadow text-black">
      <h4 className="font-semibold mb-2">Indicator Contributions</h4>

      <ul className="text-sm space-y-1">
        <li>Trend: {breakdown.trend}</li>
        <li>Momentum: {breakdown.momentum}</li>
      </ul>

      <h4 className="font-semibold mt-4 mb-1">Reasoning</h4>
      <ul className="list-disc ml-5 text-sm space-y-1">
        {reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
