"use client";

import { useState } from "react";
import CandlestickChart from "@/components/CandlestickChart";

export default function Page() {
  const [symbol, setSymbol] = useState("AAPL");
  const [interval, setInterval] = useState("d");
  const [bars, setBars] = useState<any[]>([]);
  const [weeklyBars, setWeeklyBars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);

    const dailyRes = await fetch(
      `/api/prices?symbol=${symbol}&interval=${interval}`
    );
    const weeklyRes = await fetch(
      `/api/prices?symbol=${symbol}&interval=w`
    );

    const dailyJson = await dailyRes.json();
    const weeklyJson = await weeklyRes.json();

    setBars(Array.isArray(dailyJson) ? dailyJson : dailyJson.bars ?? []);
    setWeeklyBars(
      Array.isArray(weeklyJson) ? weeklyJson : weeklyJson.bars ?? []
    );

    setLoading(false);
  }

  return (
  <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Signal Confidence Engine
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          A multi-timeframe technical confidence system combining trend, momentum,
          volume and Fibonacci structure into an interpretable signal score.
        </p>
      </div>

      {/* CONTROL BAR */}
      <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && loadData()}
          placeholder="Ticker (e.g. AAPL)"
          className="border border-gray-300 px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="d">Daily</option>
          <option value="w">Weekly</option>
          <option value="m">Monthly</option>
        </select>

        <button
          onClick={loadData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg font-medium shadow"
        >
          {loading ? "Loading…" : "Analyze"}
        </button>
        <div className="text-xs text-gray-500 max-w-md">
          This app accpets only the official stock code as input (e.g. AAPL, MSFT, NVDA).
        </div>

        <div className="text-xs text-gray-500 max-w-md">
          Timeframe controls price structure & signal sensitivity.
          Daily = tactical · Weekly = positional · Monthly = structural.
        </div>
      </div>

      {/* MAIN ANALYTICS */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
        <CandlestickChart
          symbol={symbol}
          bars={bars}
          weeklyBars={weeklyBars}
        />
      </div>

    </div>
  </main>
);
}
