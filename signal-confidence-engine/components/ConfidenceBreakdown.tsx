"use client";

type Breakdown = {
  trend: number;
  momentum: number;
  volume: number;
  breakout: number;
  fibonacci: number;
};

type Props = {
  breakdown: Breakdown;
  reasons: string[];
};

export default function ConfidenceBreakdown({ breakdown, reasons }: Props) {
  const items = [
    { label: "Trend (MA)", value: breakdown.trend },
    { label: "Momentum (RSI)", value: breakdown.momentum },
    { label: "Volume", value: breakdown.volume },
    { label: "Breakout", value: breakdown.breakout },
    { label: "Fibonacci Pivot", value: breakdown.fibonacci },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full text-black">
      <h3 className="text-lg font-semibold mb-3 text-black">
        Why this signal?
      </h3>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex justify-between text-sm text-black"
          >
            <span>{item.label}</span>
            <span
              className={
                item.value > 0
                  ? "text-green-600 font-medium"
                  : item.value < 0
                  ? "text-red-600 font-medium"
                  : "text-gray-700"
              }
            >
              {item.value > 0 ? `+${item.value}` : item.value}
            </span>
          </li>
        ))}
      </ul>

      {reasons.length > 0 && (
        <>
          <hr className="my-4 border-gray-300" />
          <ul className="list-disc list-inside space-y-1 text-sm text-black">
            {reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
