"use client";

import dynamic from "next/dynamic";
import { simpleMovingAverage, rsi } from "@/lib/indicators";
import { maCrossoverSignals } from "@/lib/signals";
import { computeConfidence } from "@/lib/confidenceEngine";
import ConfidenceGauge from "./ConfidenceGauge";
import ConfidenceBreakdown from "./ConfidenceBreakdown";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

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
  if (!Array.isArray(bars) || bars.length === 0) return null;

  const closes = bars.map((b) => b.close);

  // Raw indicator arrays (contain nulls)
  const sma50Raw = simpleMovingAverage(closes, 50);
  const sma200Raw = simpleMovingAverage(closes, 200);
  const rsi14Raw = rsi(closes, 14);

  // Cleaned arrays (NO nulls) → for logic only
  const sma50 = sma50Raw.filter((v): v is number => v !== null);
  const sma200 = sma200Raw.filter((v): v is number => v !== null);
  const rsi14 = rsi14Raw.filter((v): v is number => v !== null);

  const confidence = computeConfidence({
    bars,
    sma50,
    sma200,
    rsi14,
  });

  const signals = maCrossoverSignals(sma50Raw, sma200Raw);

  return (
    <div className="w-full">
      <Plot
        data={[
          {
            x: bars.map((b) => b.date),
            open: bars.map((b) => b.open),
            high: bars.map((b) => b.high),
            low: bars.map((b) => b.low),
            close: bars.map((b) => b.close),
            type: "candlestick",
            name: "Price",
          },
          {
            x: bars.map((b) => b.date),
            y: sma50Raw,
            type: "scatter",
            mode: "lines",
            name: "SMA 50",
            line: { color: "#2563eb", width: 1 },
          },
          {
            x: bars.map((b) => b.date),
            y: sma200Raw,
            type: "scatter",
            mode: "lines",
            name: "SMA 200",
            line: { color: "#7c3aed", width: 1 },
          },
          {
            x: signals.map((s) => bars[s.index].date),
            y: signals.map((s) => bars[s.index].close),
            mode: "markers",
            marker: {
              size: 8,
              color: signals.map((s) =>
                s.type === "BUY" ? "green" : "red"
              ),
            },
            name: "Signals",
          },
          {
            x: bars.map((b) => b.date),
            y: rsi14Raw,
            yaxis: "y2",
            type: "scatter",
            mode: "lines",
            name: "RSI (14)",
            line: { color: "#f59e0b", width: 1 },
          },
        ]}
        layout={{
          title: { text: `${symbol} — Price, MA & RSI` },
          xaxis: { rangeslider: { visible: false } },
          yaxis: { title: { text: "Price" } },
          yaxis2: {
            title: { text: "RSI" },
            overlaying: "y",
            side: "right",
            range: [0, 100],
          },
          height: 620,
          margin: { t: 50, l: 50, r: 50, b: 40 },
        }}
        style={{ width: "100%" }}
        config={{ responsive: true }}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConfidenceGauge
          score={confidence.score}
          bias={confidence.bias}
        />

        <ConfidenceBreakdown
          breakdown={confidence.breakdown}
          reasons={confidence.reasons}
        />
      </div>
    </div>
  );
}
