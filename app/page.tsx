"use client";

import { useState } from "react";
import CandlestickChart from "@/components/CandlestickChart";
import { computeMultiTimeframeConfidence } from "@/lib/multiTimeframeConfidence";

export default function Page() {
  const [symbol, setSymbol] = useState("AAPL");
  const [bars, setBars] = useState<any[]>([]);
  const [weeklyBars, setWeeklyBars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);

    const [dailyRes, weeklyRes] = await Promise.all([
      fetch(`/api/prices?symbol=${symbol}&interval=d`),
      fetch(`/api/prices?symbol=${symbol}&interval=w`),
    ]);

    const dailyData = await dailyRes.json();
    const weeklyData = await weeklyRes.json();

    setBars(dailyData);
    setWeeklyBars(weeklyData);

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Signal Confidence Engine
      </h1>

      {/* Controls */}
      <div className="mt-4 flex flex-col md:flex-row gap-3 max-w-xl">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && loadData()}
          placeholder="Ticker (e.g. AAPL)"
          className="border rounded px-3 py-2 text-black"
        />

        <button
          onClick={loadData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {/* Chart */}
      {bars.length > 0 && (
        <div className="mt-6">
          <CandlestickChart
            symbol={symbol}
            bars={bars}
          />
        </div>
      )}
    </main>
  );
}
