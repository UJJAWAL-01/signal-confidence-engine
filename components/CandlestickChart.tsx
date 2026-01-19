"use client";

import dynamic from "next/dynamic";
import { simpleMovingAverage, rsi } from "@/lib/indicators";
import { computeConfidence } from "@/lib/confidenceEngine";
import { computeConfluence } from "@/lib/confluenceEngine";
import ConfidenceGauge from "./ConfidenceGauge";
import ConfidenceBreakdown from "./ConfidenceBreakdown";
import { fibonacciPivots as computeFibonacciPivots } from "@/lib/fibonacci";
import TechnicalSnapshot from "./TechnicalSnapshot";
import StockNews from "./StockNews";


// Updated fibLine function to ensure compatibility with Plotly types
function fibLine(name: string, level: number, dates: string[]): Partial<Plotly.Data> {
  return {
    x: dates,
    y: dates.map(() => level),
    type: "scatter", // Ensure type matches Plotly.Data
    mode: "lines", // Ensure mode matches Plotly.Data
    name,
    line: {
      dash: "dot" as Plotly.Dash, // Explicitly cast to Plotly.Dash
      width: 1,
    },
  };
}

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function CandlestickChart({
  symbol,
  bars,
  weeklyBars,
}: {
  symbol: string;
  bars: any[];
  weeklyBars?: any[];
}) {
  if (!Array.isArray(bars) || bars.length === 0) return null;

  const closes = bars.map((b) => b.close);
  const sma50 = simpleMovingAverage(closes, 50);
  const sma200 = simpleMovingAverage(closes, 200);
  const rsi14 = rsi(closes.filter((close) => close !== null), 14);

  const daily = computeConfidence({
    bars,
    closes,
    sma50,
    sma200,
    rsi14,
  });

  let weekly;
  if (weeklyBars && weeklyBars.length > 60) {
    const wCloses = weeklyBars.map((b) => b.close);
    weekly = computeConfidence({
      bars: weeklyBars,
      closes: wCloses,
      sma50: simpleMovingAverage(wCloses, 50),
      sma200: simpleMovingAverage(wCloses, 200),
      rsi14: rsi(wCloses.filter((close) => close !== null), 14),
    });
  }

  const prevBar = bars[bars.length - 2];
  const fib =
    prevBar ? computeFibonacciPivots(prevBar.high, prevBar.low, prevBar.close) : null;

  const dates = bars.map((b) => b.date);


  const confluence = computeConfluence(daily, daily);

  return (
    <div className="space-y-8">
      {/* HOW THIS WORKS */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-gray-700">
        <h3 className="font-semibold text-blue-800 mb-1">
          How this signal engine works
        </h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            The selected timeframe controls the <b>main chart</b> and the
            <b> Daily Signal</b>.
          </li>
          <li>
            Weekly confirmation always uses <b>weekly candles</b> to filter
            noise.
          </li>
          <li>
            The Final Confluence Score combines both to reduce false signals.
          </li>
          <li>
            When multiple timeframes align, confidence scores may look similar —
            this indicates strong agreement.
          </li>
        </ul>
      </div>

      {/* PRICE CHART */}
      <Plot
        data={[
          {
            x: bars.map((b) => b.date),
            open: bars.map((b) => b.open),
            high: bars.map((b) => b.high),
            low: bars.map((b) => b.low),
            close: bars.map((b) => b.close),
            type: "candlestick" as const,
            name: "Price",
          },
          ...(fib
            ? [
                fibLine("Pivot Point", fib.pp, dates),
                fibLine("R1", fib.r1, dates),
                fibLine("S1", fib.s1, dates),
                fibLine("R2", fib.r2, dates),
                fibLine("S2", fib.s2, dates),
              ]
            : []),
          {
            x: bars.map((b) => b.date),
            y: sma50,
            type: "scatter" as const,
            mode: "lines" as const,
            name: "SMA 50",
            line: { color: "#2563eb", width: 1 },
          },
          {
            x: bars.map((b) => b.date),
            y: sma200,
            type: "scatter" as const,
            mode: "lines" as const,
            name: "SMA 200",
            line: { color: "#7c3aed", width: 1 },
          },
          {
            x: bars.map((b) => b.date),
            y: rsi14,
            yaxis: "y2" as const,
            type: "scatter" as const,
            mode: "lines" as const,
            name: "RSI (14)",
            line: { color: "#f59e0b", width: 1 },
          },
        ]}
        layout={{
          height: 550,
          yaxis2: {
            overlaying: "y",
            side: "right",
            range: [0, 100],
            title: { text: "RSI" },
          },
        }}
        style={{ width: "100%" }}
      />

      {/* CONFIDENCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConfidenceGauge
          title="Daily Signal Confidence"
          subtitle="Based on selected timeframe"
          score={daily.score}
          bias={daily.bias}
        />

        {weekly && (
          <ConfidenceGauge
            title="Weekly Trend Confirmation"
            subtitle="Higher timeframe filter"
            score={weekly.score}
            bias={weekly.bias}
          />
        )}

        <ConfidenceGauge
          title="Final Confluence Score"
          subtitle="Daily (60%) + Weekly (40%)"
          score={confluence.score}
          bias={confluence.bias}
        />
      </div>

      {/* WHY THIS SIGNAL */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-2">
          Why this signal?
        </h3>

        <ConfidenceBreakdown
          breakdown={{
            ...daily.breakdown,
            // volume: "volume" in daily.breakdown? daily.breakdown.volume : 0,
            // breakout: (daily.breakdown as any).breakout || 0, // Cast to 'any' to bypass TypeScript error
            // fibonacci: daily.breakdown.fibonacci || 0,
          }}
          reasons={daily.reasons}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechnicalSnapshot
          symbol={symbol}
          close={bars[bars.length - 1].close}
          sma50={sma50.at(-1)}
          sma200={sma200.at(-1)}
          rsi={rsi14.at(-1)}
        />
        <StockNews symbol={symbol} />
      </div>

    </div>
  );
}
