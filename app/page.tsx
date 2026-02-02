"use client";

import { useState } from "react";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import CompleteTradingDashboard from "@/components/CompleteTradingDashboard";
type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export default function Page() {
  return <CompleteTradingDashboard />;
  const [symbol, setSymbol] = useState("AAPL");
  const [bars, setBars] = useState<Bar[]>([]);
  const [weeklyBars, setWeeklyBars] = useState<Bar[]>([]);
  const [monthlyBars, setMonthlyBars] = useState<Bar[]>([]);
  const [marketBars, setMarketBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [dailyRes, weeklyRes, monthlyRes, marketRes] = await Promise.all([
        fetch(`/api/prices?symbol=${symbol}&interval=d`),
        fetch(`/api/prices?symbol=${symbol}&interval=w`),
        fetch(`/api/prices?symbol=${symbol}&interval=m`),
        fetch(`/api/prices?symbol=SPY&interval=d`)
      ]);

      if (!dailyRes.ok){ 
        throw new Error("Failed to fetch data");
      }

      const dailyData = await dailyRes.json();
      const weeklyData = await weeklyRes.json();
      const monthlyData = await monthlyRes.json();
      const marketData = await marketRes.json();

      if (!Array.isArray(dailyData) || dailyData.length === 0) {
        throw new Error("No data available for this symbol");
      }

      setBars(dailyData);
      setWeeklyBars(weeklyData);
      setMonthlyBars(monthlyData);
      setMarketBars(marketData);

    } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', err);
    }
    setError(err.message || 'Failed to load data. Please try again.');
    setBars([]);
  } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {bars.length === 0 && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-md w-full mx-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Signal Intelligence Platform
                </h1>
                <p className="text-slate-400 text-sm">
                  Advanced technical analysis & market forecasting
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && loadData()}
                    placeholder="AAPL, MSFT, TSLA..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={loadData}
                  disabled={loading || !symbol}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Generate Signal Analysis'
                  )}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="text-xs text-slate-500 space-y-2">
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Statistical forecasting models & technical indicators</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Probability-based market scenarios</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Educational analysis - not investment advice</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {bars.length > 0 && (
        <UnifiedDashboard
          symbol={symbol}
          dailyBars={bars}
          weeklyBars={weeklyBars}
          monthlyBars={monthlyBars}
          marketBars={marketBars}
          onReset={() => {
            setBars([]);
            setWeeklyBars([]);
            setMonthlyBars([]);
            setMarketBars([]);
          }}
        />
      )}
    </div>
  );
}