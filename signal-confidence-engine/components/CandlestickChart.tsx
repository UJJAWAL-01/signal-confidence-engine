"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Props = {
  symbol: string;
  bars: Bar[];
};

export default function CandlestickChart({ symbol, bars }: Props) {
  return (
    <Plot
      data={[
        {
          x: bars.map((b) => b.date),
          open: bars.map((b) => b.open),
          high: bars.map((b) => b.high),
          low: bars.map((b) => b.low),
          close: bars.map((b) => b.close),
          type: "candlestick",
          increasing: { line: { color: "#16a34a" } },
          decreasing: { line: { color: "#dc2626" } },
        },
      ]}
      layout={{
        title: { text: `${symbol} — Candlestick Chart` },
        xaxis: { rangeslider: { visible: false } },
        yaxis: { fixedrange: false },
        height: 520,
        margin: { t: 50, l: 50, r: 30, b: 40 },
      }}
      style={{ width: "100%" }}
      config={{ responsive: true }}
    />
  );
}
