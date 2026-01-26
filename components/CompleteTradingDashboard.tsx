"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Activity, Info, CheckCircle2, Sun, Moon, X, Search, BarChart3, AlertTriangle, Newspaper } from 'lucide-react';
import { computeInstitutionalSignal } from '@/lib/institutionalEngine';
import { simpleMovingAverage, rsi } from '@/lib/indicators';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Popular symbols for autocomplete
const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'DIS', name: 'Walt Disney Company' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'BA', name: 'Boeing Company' },
  { symbol: 'GE', name: 'General Electric' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF' }
];

export default function CompleteTradingDashboard() {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interval, setInterval] = useState('d');
  const [dailyBars, setDailyBars] = useState<any[]>([]);
  const [weeklyBars, setWeeklyBars] = useState<any[]>([]);
  const [monthlyBars, setMonthlyBars] = useState<any[]>([]);
  const [marketBars, setMarketBars] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredSymbols = POPULAR_SYMBOLS.filter(s => 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (symbol) loadData();
  }, [symbol]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dailyRes, weeklyRes, monthlyRes, marketRes, newsRes] = await Promise.all([
        fetch(`/api/prices?symbol=${symbol}&interval=d`),
        fetch(`/api/prices?symbol=${symbol}&interval=w`),
        fetch(`/api/prices?symbol=${symbol}&interval=m`),
        fetch(`/api/prices?symbol=SPY&interval=d`),
        fetch(`/api/news?symbol=${symbol}`)
      ]);

      const daily = await dailyRes.json();
      const weekly = await weeklyRes.json();
      const monthly = await monthlyRes.json();
      const market = await marketRes.json();
      const newsData = await newsRes.json();

      setDailyBars(Array.isArray(daily) ? daily : []);
      setWeeklyBars(Array.isArray(weekly) ? weekly : []);
      setMonthlyBars(Array.isArray(monthly) ? monthly : []);
      setMarketBars(Array.isArray(market) ? market : []);
      setNews(newsData?.news || []);

      if (daily.length && weekly.length && monthly.length && market.length) {
        const result = computeInstitutionalSignal(daily, weekly, monthly, market);
        result.symbol = symbol;
        setAnalysis(result);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolSelect = (sym: string) => {
  setSymbol(sym);
  setSearchTerm(sym);
  setShowSuggestions(false);
};


  // Get current display bars based on interval
  const displayBars = interval === 'w' ? weeklyBars : interval === 'm' ? monthlyBars : dailyBars;
  const closes = displayBars.map(b => b.close);
  const sma50 = simpleMovingAverage(closes, 50);
  const sma200 = simpleMovingAverage(closes, 200);
  const rsi14 = rsi(closes, 14);

  const currentPrice = dailyBars[dailyBars.length - 1]?.close || 0;
  const prevPrice = dailyBars[dailyBars.length - 2]?.close || currentPrice;
  const change = currentPrice - prevPrice;
  const changePercent = (change / prevPrice) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 80) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (score >= 70) return isDark ? 'text-teal-400' : 'text-teal-600';
    if (score >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-orange-400' : 'text-orange-600';
  };

  const getGradientForScore = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 70) return 'from-teal-500 to-cyan-500';
    if (score >= 60) return 'from-yellow-500 to-orange-400';
    return 'from-orange-500 to-red-500';
  };

  // Theme classes
  const bgPrimary = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-slate-900' : 'bg-white';
  const bgTertiary = isDark ? 'bg-slate-800' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-slate-400' : 'text-gray-500';
  const textSecondary = isDark ? 'text-slate-300' : 'text-gray-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-500';
  const border = isDark ? 'border-slate-700' : 'border-gray-200';
  

  if (loading && !analysis) {
    return (
      <div className={`min-h-screen ${bgPrimary} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={textSecondary}>Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrimary}`}>
      {/* Disclaimer Banner */}
      {showDisclaimer && (
        <div className={`${isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'} border-b`}>
          <div className="max-w-[1800px] mx-auto px-6 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  <strong>Educational Tool - Not Financial Advice:</strong> This platform provides statistical analysis for educational purposes only. We are not registered investment advisors. Always consult a qualified professional before making investment decisions.
                </p>
              </div>
              <button onClick={() => setShowDisclaimer(false)} className="p-1">
                <X className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${bgSecondary} ${border} border-b backdrop-blur-xl sticky top-0 z-50 shadow-lg`}>
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-lg font-bold ${textMuted}`}>Signal Intelligence Platform</h1>
                <p className={`text-xs ${textMuted}`}>Technical Forecasting & Analysis</p>
              </div>
            </div>

            {/* Symbol Search */}
            <div className="flex-1 max-w-md relative">
              <div className="relative">
                <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value.toUpperCase());
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search symbol or company..."
                    className={`w-full pl-10 pr-4 py-2 ${bgTertiary} ${border} border rounded-lg ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />

              </div>
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && searchTerm && filteredSymbols.length > 0 && (
                <div className={`absolute top-full mt-2 w-full ${bgSecondary} ${border} border rounded-lg shadow-xl max-h-64 overflow-y-auto z-50`}>
                  {filteredSymbols.map(s => (
                    <button
                      key={s.symbol}
                      onClick={() => handleSymbolSelect(s.symbol)}
                      className={`w-full px-4 py-3 text-left hover:${bgTertiary} transition-colors border-b ${border} last:border-0`}
                    >
                      <div className={`font-semibold ${textPrimary}`}>{s.symbol}</div>
                      <div className={`text-sm ${textMuted}`}>{s.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Timeframe Selector */}
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className={`px-4 py-2 ${bgTertiary} ${border} border rounded-lg ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >
              <option value="d">Daily</option>
              <option value="w">Weekly</option>
              <option value="m">Monthly</option>
            </select>

            <button
  onClick={() => {
    if (searchTerm.trim()) {
      setSymbol(searchTerm.trim().toUpperCase());
      setShowSuggestions(false);
    }
  }}
  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:opacity-90 transition"
>
  Analyze
</button>


            {/* Price Display */}
            <div className={`px-4 py-2 ${bgTertiary} rounded-lg ${border} border`}>
              <div className={`text-xs ${textMuted}`}>{symbol}</div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${textPrimary}`}>${currentPrice.toFixed(2)}</span>
                <span className={`text-sm ${changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${bgTertiary} ${border} border hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'} transition-colors`}
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Chart & Analysis */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* Signal Score Card */}
            {analysis && (
              <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="none" className={isDark ? 'text-slate-700' : 'text-gray-200'} />
                        <circle cx="80" cy="80" r="70" stroke="url(#scoreGradient)" strokeWidth="10" fill="none" strokeDasharray={`${analysis.signal.score * 4.4} 440`} strokeLinecap="round" className="transition-all duration-1000" />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-4xl font-bold ${textPrimary}`}>{analysis.signal.score}</div>
                        <div className={`text-xs ${textMuted}`}>Signal Score</div>
                        <div className={`text-lg font-bold mt-1 bg-gradient-to-r ${getGradientForScore(analysis.signal.score)} bg-clip-text text-transparent`}>
                          {analysis.signal.grade}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 gap-4">
                    <div className={`${bgTertiary} rounded-lg p-4 ${border} border relative group`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`text-xs ${textMuted} mb-1`}>Sharpe Ratio</div>
                          <div className="text-2xl font-bold text-emerald-500">{analysis.signal.sharpeRatio}</div>
                          <div className={`text-xs ${textMuted}`}>Risk-adjusted return</div>
                        </div>
                        <Info className={`w-4 h-4 ${textMuted} cursor-help`} />
                      </div>
                      <div className={`absolute left-0 top-full mt-2 w-64 ${bgSecondary} ${border} border rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}>
                        <p className={`text-xs ${textSecondary}`}>
                          <strong>Simple:</strong> Measures return vs risk. Above 1.0 is good, above 2.0 is excellent. Higher means better risk-adjusted performance.
                        </p>
                      </div>
                    </div>

                    <div className={`${bgTertiary} rounded-lg p-4 ${border} border relative group`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`text-xs ${textMuted} mb-1`}>Alpha</div>
                          <div className="text-2xl font-bold text-teal-500">{analysis.signal.alpha}%</div>
                          <div className={`text-xs ${textMuted}`}>Vs market</div>
                        </div>
                        <Info className={`w-4 h-4 ${textMuted} cursor-help`} />
                      </div>
                      <div className={`absolute left-0 top-full mt-2 w-64 ${bgSecondary} ${border} border rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}>
                        <p className={`text-xs ${textSecondary}`}>
                          <strong>Simple:</strong> Outperformance vs market (S&P 500). Positive = beating market. Negative = underperforming market.
                        </p>
                      </div>
                    </div>

                    <div className={`${bgTertiary} rounded-lg p-4 ${border} border relative group`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`text-xs ${textMuted} mb-1`}>Beta</div>
                          <div className="text-2xl font-bold text-yellow-500">{analysis.signal.beta}</div>
                          <div className={`text-xs ${textMuted}`}>Market sensitivity</div>
                        </div>
                        <Info className={`w-4 h-4 ${textMuted} cursor-help`} />
                      </div>
                      <div className={`absolute left-0 top-full mt-2 w-64 ${bgSecondary} ${border} border rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}>
                        <p className={`text-xs ${textSecondary}`}>
                          <strong>Simple:</strong> How much it moves with the market. 1.0 = moves same as market. Above 1.0 = more volatile. Below 1.0 = less volatile.
                        </p>
                      </div>
                    </div>

                    <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                      <div className={`text-xs ${textMuted} mb-1`}>Volatility (30d)</div>
                      <div className="text-2xl font-bold text-orange-500">{analysis.signal.volatility}%</div>
                      <div className={`text-xs ${textMuted}`}>Annualized</div>
                    </div>

                    <div className={`md:col-span-2 ${bgTertiary} rounded-lg p-4 ${border} border`}>
                      <div className={`text-xs ${textMuted} mb-2`}>Forecast Summary</div>
                      <p className={`text-sm ${textSecondary}`}>{analysis.signal.summary}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Price Chart with Technical Indicators
                <span className={`text-sm font-normal ${textMuted} ml-auto`}>
                  {interval === 'd' ? 'Daily' : interval === 'w' ? 'Weekly' : 'Monthly'} View
                </span>
              </h3>
              
              {displayBars.length > 0 && (
                <Plot
                  data={[
                    {
                      x: displayBars.map(b => b.date),
                      open: displayBars.map(b => b.open),
                      high: displayBars.map(b => b.high),
                      low: displayBars.map(b => b.low),
                      close: displayBars.map(b => b.close),
                      type: 'candlestick',
                      name: 'Price',
                      increasing: { line: { color: '#10b981' } },
                      decreasing: { line: { color: '#ef4444' } }
                    },
                    {
                      x: displayBars.map(b => b.date),
                      y: sma50,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'SMA 50',
                      line: { color: '#3b82f6', width: 2 }
                    },
                    {
                      x: displayBars.map(b => b.date),
                      y: sma200,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'SMA 200',
                      line: { color: '#8b5cf6', width: 2 }
                    },
                    {
                      x: displayBars.map(b => b.date),
                      y: rsi14,
                      yaxis: 'y2',
                      type: 'scatter',
                      mode: 'lines',
                      name: 'RSI (14)',
                      line: { color: '#f59e0b', width: 2 }
                    }
                  ]}
                  layout={{
                    height: 600,
                    paper_bgcolor: isDark ? '#0f172a' : '#ffffff',
                    plot_bgcolor: isDark ? '#1e293b' : '#f9fafb',
                    font: { color: isDark ? '#cbd5e1' : '#374151', family: 'Inter, system-ui, sans-serif' },
                    xaxis: {
                      gridcolor: isDark ? '#334155' : '#e5e7eb',
                      showgrid: true,
                      rangeslider: { visible: false },
                      type: 'date'
                    },
                    yaxis: {
                      gridcolor: isDark ? '#334155' : '#e5e7eb',
                      showgrid: true,
                      title: { text: 'Price ($)' }
                    },
                    yaxis2: {
                      overlaying: 'y',
                      side: 'right',
                      range: [0, 100],
                      gridcolor: isDark ? '#334155' : '#e5e7eb',
                      title: { text: 'RSI' }
                    },
                    showlegend: true,
                    legend: {
                      orientation: 'h',
                      y: -0.2,
                      x: 0
                    },
                    margin: { t: 20, b: 80, l: 60, r: 60 },
                    dragmode: 'zoom',
                    hovermode: 'x unified'
                  }}
                  config={{
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                    toImageButtonOptions: {
                      format: 'png',
                      filename: `${symbol}_chart`,
                      height: 800,
                      width: 1400
                    }
                  }}
                  style={{ width: '100%' }}
                />
              )}
            </div>

            {/* Tabs */}
            {analysis && (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { id: 'overview', label: ' Forecast Overview' },
                    { id: 'scenarios', label: ' Market Scenarios' },
                    { id: 'analysis', label: ' Deep Analysis' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                          : `${bgTertiary} ${textSecondary}`
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Statistical Model Breakdown</h3>
                      {analysis.signal.reasoning.map((reason: string, i: number) => (
                        <div key={i} className={`flex items-start gap-3 p-3 ${bgTertiary} rounded-lg`}>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className={`text-sm ${textSecondary}`}>{reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'scenarios' && (
          <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
            <div className="flex items-center gap-3 mb-6">
              {/* <Target className="w-6 h-6 text-emerald-500" /> */}
              <h3 className={`text-xl font-bold ${textPrimary}`}>Potential Market Scenarios</h3>
              <div className={`ml-auto px-3 py-1 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} rounded-lg text-sm font-semibold border ${isDark ? 'border-emerald-500/30' : 'border-emerald-300'}`}>
                R:R {analysis.trade.riskReward}:1
              </div>
            </div>

            <div className={`${isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'} border rounded-lg p-4 mb-6`}>
              <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                <strong>Educational Forecast:</strong> These scenarios are statistical projections based on historical patterns and technical analysis. They represent possible outcomes, not predictions or recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                <div className={`text-xs ${textMuted} mb-2`}>📍 Potential Entry Zones</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-emerald-500 font-semibold">Primary Zone</div>
                    <div className={`text-2xl font-bold ${textPrimary}`}>${analysis.trade.entry.optimal}</div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={textMuted}>Aggressive:</span>
                    <span className={textSecondary}>${analysis.trade.entry.aggressive}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={textMuted}>Conservative:</span>
                    <span className={textSecondary}>${analysis.trade.entry.conservative}</span>
                  </div>
                </div>
                <p className={`text-xs ${textMuted} mt-3`}>{analysis.trade.entry.reasoning}</p>
              </div>

              <div className={`${bgTertiary} rounded-lg p-4 border border-red-500/30`}>
                <div className={`text-xs ${textMuted} mb-2`}>🛡️ Risk Level</div>
                <div className="text-3xl font-bold text-red-500 mb-1">${analysis.trade.stopLoss.price}</div>
                <div className={`text-sm ${textSecondary} mb-3`}>{analysis.trade.stopLoss.percent}% potential decline</div>
                <p className={`text-xs ${textMuted}`}>{analysis.trade.stopLoss.reasoning}</p>
              </div>

              <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                <div className={`text-xs ${textMuted} mb-2`}>💰 Suggested Allocation</div>
                <div className="text-2xl font-bold text-emerald-500 mb-1">{analysis.trade.positionSize}</div>
                <div className={`text-xs ${textSecondary} mb-3`}>Max risk: {analysis.trade.maxLoss}</div>
                <div className={`text-xs ${textMuted}`}>Based on 2% risk management principle</div>
              </div>
            </div>

            <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
              <div className={`text-sm font-semibold ${textPrimary} mb-3`}> Potential Upside Scenarios</div>
              <div className="space-y-3">
                {Object.entries(analysis.trade.targets).map(([key, target]: [string, any]) => (
                  <div key={key} className="flex items-center gap-11">
                    <div className="flex-shrink-0 w-12">
                      <div className={`text-xs ${textMuted}`}>{key.toUpperCase()}</div>
                      <div className="text-lg font-bold text-emerald-500">${target.price}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 ">
                        <span className={`text-sm ${textSecondary}`}>+{target.percent}% potential</span>
                        <span className={`text-xs ${textMuted}`}>{target.probability}% probability</span>
                      </div>
                      <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                          style={{ width: `${target.probability}%` }}
                        />
                      </div>
                    </div>
                    <div className={`flex-shrink-0 text-xs ${textMuted} w-32`}>
                      {target.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

                  {activeTab === 'analysis' && analysis.layers && (
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(analysis.layers).map(([layerName, layerData]: [string, any]) => (
                        <div key={layerName} className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className={`font-bold ${textPrimary} capitalize`}>{layerName}</h4>
                            <span className={`text-2xl font-bold ${getScoreColor(layerData.score)}`}>{layerData.score}</span>
                          </div>
                          {layerData.components?.map((comp: any, i: number) => (
                            <div key={i} className={`p-3 ${isDark ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg mb-2`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${textPrimary}`}>{comp.name}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  comp.signal === 'BULLISH' || comp.signal === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                                  comp.signal === 'BEARISH' || comp.signal === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                                  'bg-slate-600 text-slate-300'
                                }`}>
                                  {comp.signal}
                                </span>
                              </div>
                              <p className={`text-xs ${textMuted} mb-2`}>{comp.desc || comp.description}</p>
                              <div className={`h-1.5 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                <div className={`h-full bg-gradient-to-r ${getGradientForScore(comp.value || comp.score)} transition-all`} style={{ width: `${comp.value || comp.score}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            
            {/* Technical Snapshot */}
            {analysis && (
              <div className={`${bgSecondary} rounded-xl ${border} border p-4 shadow-lg`}>
                <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Technical Snapshot
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-xs ${textMuted}`}>Last Price</span>
                    <span className={`text-sm font-semibold ${textPrimary}`}>${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${textMuted}`}>SMA 50</span>
                    <span className={`text-sm font-semibold ${textPrimary}`}>${sma50[sma50.length - 1]?.toFixed(2) || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${textMuted}`}>SMA 200</span>
                    <span className={`text-sm font-semibold ${textPrimary}`}>${sma200[sma200.length - 1]?.toFixed(2) || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${textMuted}`}>RSI (14)</span>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{rsi14[rsi14.length - 1]?.toFixed(1) || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${textMuted}`}>Volatility</span>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{analysis?.signal?.volatility}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* News */}
            <div className={`${bgSecondary} rounded-xl ${border} border p-4 shadow-lg`}>
              <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                <Newspaper className="w-4 h-4 text-emerald-500" />
                Latest News — {symbol}
              </h3>
              {loading ? (
                <p className={`text-xs ${textMuted}`}>Loading news...</p>
              ) : news.length === 0 ? (
                <p className={`text-xs ${textMuted}`}>No recent news found</p>
              ) : (
                <div className="space-y-3">
                  {news.slice(0, 5).map((item: any, i: number) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block p-2 ${bgTertiary} rounded hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'} transition-colors`}
                    >
                      <p className={`text-xs ${textPrimary} font-medium line-clamp-2 mb-1`}>{item.title}</p>
                      <p className={`text-[10px] ${textMuted}`}>{item.publisher}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Factors */}
            {analysis?.risks && analysis.risks.length > 0 && (
              <div className={`${bgSecondary} rounded-xl ${border} border p-4 shadow-lg`}>
                <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Factors to Monitor
                </h3>
                <div className="space-y-2">
                  {analysis.risks.map((risk: any, i: number) => (
                    <div key={i} className={`p-3 ${bgTertiary} rounded-lg`}>
                      <div className={`text-xs px-2 py-1 rounded inline-block mb-2 ${
                        risk.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        risk.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {risk.severity}
                      </div>
                      <p className={`text-xs font-semibold ${textPrimary} mb-1`}>{risk.title}</p>
                      <p className={`text-[10px] ${textMuted}`}>{risk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-t mt-12`}>
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-6 ${border} border mb-6`}>
            <h4 className={`font-bold ${textPrimary} mb-3`}>⚠️ Important Disclaimer</h4>
            <div className={`text-sm ${textMuted} space-y-2`}>
              <p>
                <strong>Not Investment Advice:</strong> This platform is an educational tool for technical analysis and statistical forecasting. All information, predictions, scores, and scenarios are provided for informational and educational purposes only.
              </p>
              <p>
                <strong>No Professional Relationship:</strong> We are not registered investment advisors, brokers, or financial planners. Use of this tool does not create an advisory relationship. Always consult with a qualified financial professional before making investment decisions.
              </p>
              <p>
                <strong>No Guarantees:</strong> Past performance does not indicate future results. Technical analysis and statistical models have inherent limitations. Market conditions can change rapidly, and predictions may not materialize.
              </p>
              <p>
                <strong>Your Responsibility:</strong> You are solely responsible for your own investment decisions. By using this tool, you acknowledge that you understand the risks involved in trading and investing, and that you will not hold us liable for any losses.
              </p>
              <p>
                <strong>Data Accuracy:</strong> While we strive for accuracy, we do not guarantee the completeness or accuracy of any data, analysis, or forecasts. Technical errors may occur.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h5 className={`font-semibold ${textPrimary} mb-2`}>What This Tool Does</h5>
              <ul className={`text-sm ${textMuted} space-y-1`}>
                <li>• Analyzes historical price patterns</li>
                <li>• Calculates technical indicators</li>
                <li>• Provides statistical forecasts</li>
                <li>• Shows risk/reward scenarios</li>
              </ul>
            </div>
            <div>
              <h5 className={`font-semibold ${textPrimary} mb-2`}>What This Tool Does NOT Do</h5>
              <ul className={`text-sm ${textMuted} space-y-1`}>
                <li>• Provide personalized advice</li>
                <li>• Guarantee future outcomes</li>
                <li>• Replace professional counsel</li>
                <li>• Manage your investments</li>
              </ul>
            </div>
            <div>
              <h5 className={`font-semibold ${textPrimary} mb-2`}>Metrics Used</h5>
              <ul className={`text-sm ${textMuted} space-y-1`}>
                <li>• Sharpe Ratio (risk-adjusted return)</li>
                <li>• Alpha/Beta (CAPM model)</li>
                <li>• RSI, MACD, SMA (technicals)</li>
                <li>• ATR (volatility measure)</li>
              </ul>
            </div>
          </div>

          <div className={`text-center text-xs ${textMuted} pt-6 border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
            <p>© 2025 Signal Intelligence Platform • Educational Use Only • Not a Registered Investment Advisor</p>
            <p className="mt-1">All trading and investing involves risk. You can lose money. Consult a professional before making financial decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}