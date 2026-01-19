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
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-black">
          Signal Confidence Engine
        </h1>

        <div className="bg-white p-4 rounded shadow flex gap-3 flex-wrap">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
            className="border px-3 py-2 rounded text-black"
          />

          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="border px-3 py-2 rounded text-black"
          >
            <option value="d">Daily</option>
            <option value="w">Weekly</option>
            <option value="m">Monthly</option>
          </select>
          

          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Loading..." : "Load"}
          </button>
          <p className="mt-2 text-sm text-gray-600">
              Timeframe selection changes price structure and signal sensitivity.
              Daily is tactical, Weekly is positional, Monthly is structural.
          </p>

        </div>

        <CandlestickChart
          symbol={symbol}
          bars={bars}
          weeklyBars={weeklyBars}
        />
      </div>
    </main>
  );
}
