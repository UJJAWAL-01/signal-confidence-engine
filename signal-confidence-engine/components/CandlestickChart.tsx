"use client";

import dynamic from "next/dynamic";
import { simpleMovingAverage, rsi } from "@/lib/indicators";
import { maCrossoverSignals } from "@/lib/signals";
import { computeConfidence } from "@/lib/confidenceEngine";


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
  const closes = bars.map((b) => b.close);

  const sma50 = simpleMovingAverage(closes, 50);
  const sma200 = simpleMovingAverage(closes, 200);
  const rsi14 = rsi(closes, 14);
  const sma50Clean = sma50.filter((v) => v != null);
  const sma200Clean = sma200.filter((v) => v != null);



  const confidence = computeConfidence({
    bars,
    sma50, 
    sma200,
    rsi14,
  });

  console.log("BARS:", bars.length);
  console.log("LAST SMA50:", sma50[bars.length - 1]);
  console.log("LAST SMA200:", sma200[bars.length - 1]);
  console.log("LAST RSI14:", rsi14[bars.length - 1]);


  console.log("CONFIDENCE:", symbol, confidence);

  const signals = maCrossoverSignals(sma50, sma200);

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
          name: "Price",
        },
        {
          x: bars.map((b) => b.date),
          y: sma50Clean,
          type: "scatter",
          mode: "lines",
          name: "SMA 50",
          line: { color: "#2563eb" },
        },
        {
          x: bars.map((b) => b.date),
          y: sma200Clean,
          type: "scatter" as const,
          mode: "lines",
          name: "SMA 200",
          line: { color: "#7c3aed" },
        },
        {
          x: signals.map((s) => bars[s.index].date),
          y: signals.map((s) => bars[s.index].close),
          mode: "markers",
          marker: {
            size: 10,
            color: signals.map((s) => (s.type === "BUY" ? "green" : "red")),
          },
          name: "Signals",
        },
        {
          x: bars.map((b) => b.date),
          y: rsi14,
          yaxis: "y2",
          type: "scatter",
          mode: "lines",
          name: "RSI (14)",
          line: { color: "#f59e0b" },
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
  );
}
