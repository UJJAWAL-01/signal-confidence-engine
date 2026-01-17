"use client";

import { useState } from "react";
import CandlestickChart from "@/components/CandlestickChart";

export default function Home() {
  const [symbol, setSymbol] = useState("AAPL");
  const [bars, setBars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<"d" | "w" | "m">("d");


  async function loadData() {
    setLoading(true);
    setError(null);
    setBars([]);

    try {
      const resp = await fetch(`/api/prices?symbol=${symbol}&interval=${interval}`);
      const data = await resp.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to load data");
      }

      setBars(data.bars);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

   function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      loadData();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
          Signal Confidence Engine
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Ticker */}
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Ticker (e.g. AAPL)"
              className="flex-1 px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Timeframe */}
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as any)}
              className="px-4 py-2 rounded-lg border text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="d">Daily</option>
              <option value="w">Weekly</option>
              <option value="m">Monthly</option>
            </select>

            {/* Load Button */}
            <button
              onClick={loadData}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {bars.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <CandlestickChart symbol={symbol} bars={bars} />
        </div>
      )}
    </main>
  );
}