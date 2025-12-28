"use client";

import { useState } from "react";
import CandlestickChart from "@/components/CandlestickChart";

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export default function Home() {
  const [symbol, setSymbol] = useState("AAPL");
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    setBars([]);

    try {
      const resp = await fetch(`/api/prices?symbol=${symbol}&interval=d`);
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

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        Signal Confidence Engine
      </h1>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker (e.g. AAPL)"
          style={{
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 4,
            width: 160,
          }}
        />
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: 12, color: "red" }}>
          Error: {error}
        </p>
      )}

      {bars.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <CandlestickChart symbol={symbol} bars={bars} />
        </div>
      )}
    </main>
  );
}
