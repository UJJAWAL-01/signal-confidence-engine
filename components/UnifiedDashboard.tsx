"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, Info, CheckCircle2, Sun, Moon, X } from 'lucide-react';
import { computeInstitutionalSignal } from '@/lib/institutionalEngine';
import { simpleMovingAverage, rsi } from '@/lib/indicators';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = {
  symbol: string;
  dailyBars: any[];
  weeklyBars: any[];
  monthlyBars: any[];
  marketBars: any[];
  onReset: () => void;
};

export default function UnifiedDashboard({ 
  symbol, 
  dailyBars, 
  weeklyBars, 
  monthlyBars,
  marketBars,
  onReset 
}: Props) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isDark, setIsDark] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    if (dailyBars.length && weeklyBars.length && monthlyBars.length && marketBars.length) {
      try {
        const result = computeInstitutionalSignal(dailyBars, weeklyBars, monthlyBars, marketBars);
        result.symbol = symbol;
        setAnalysis(result);
      } catch (error) {
        console.error('Calculation error:', error);
      }
    }
  }, [dailyBars, weeklyBars, monthlyBars, marketBars, symbol]);

  // Calculate chart indicators
  const closes = dailyBars.map(b => b.close);
  const sma50 = simpleMovingAverage(closes, 50);
  const sma200 = simpleMovingAverage(closes, 200);
  const rsi14 = rsi(closes, 14);

  if (!analysis) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>Computing statistical models...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (score >= 70) return isDark ? 'text-teal-400' : 'text-teal-600';
    if (score >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    if (score >= 50) return isDark ? 'text-orange-400' : 'text-orange-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getGradientForScore = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 70) return 'from-teal-500 to-cyan-500';
    if (score >= 60) return 'from-yellow-500 to-orange-400';
    return 'from-orange-500 to-red-500';
  };

  const getBiasIcon = (bias?: string) => {
    if (bias?.toLowerCase().includes('bullish')) return <TrendingUp className="w-5 h-5" />;
    if (bias?.toLowerCase().includes('bearish')) return <TrendingDown className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  // Theme classes
  const bgPrimary = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-slate-900' : 'bg-white';
  const bgTertiary = isDark ? 'bg-slate-800' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-gray-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-500';
  const border = isDark ? 'border-slate-700' : 'border-gray-200';
  const borderLight = isDark ? 'border-slate-800' : 'border-gray-100';

  return (
    <div className={`min-h-screen ${bgPrimary}`}>
      {/* Disclaimer Banner */}
      {showDisclaimer && (
        <div className={`${isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'} border-b`}>
          <div className="max-w-[1600px] mx-auto px-6 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <div className="text-sm">
                  <p className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-900'} mb-1`}>
                    Educational Tool - Not Financial Advice
                  </p>
                  <p className={isDark ? 'text-amber-200/80' : 'text-amber-800'}>
                    This platform provides statistical analysis and technical forecasting for educational purposes only. All predictions, scenarios, and metrics are based on historical data and mathematical models. We are not registered investment advisors. Past performance does not guarantee future results. Always consult with a qualified financial advisor before making investment decisions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDisclaimer(false)}
                className={`p-1 rounded hover:${isDark ? 'bg-amber-800/30' : 'bg-amber-100'} transition-colors`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200'} border-b backdrop-blur-xl sticky top-0 z-50`}>
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>Signal Intelligence Platform</h1>
                <p className={`text-xs ${textMuted}`}>Technical Forecasting & Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Light/Dark Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg ${bgTertiary} ${border} border hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'} transition-colors`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              {/* Symbol Display */}
              <div className={`flex items-center gap-3 px-4 py-2 ${bgTertiary} rounded-lg ${border} border`}>
                <span className={`text-2xl font-bold ${textPrimary}`}>{symbol}</span>
                <div className="h-6 w-px bg-gray-400"></div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${textPrimary}`}>${analysis.price.toFixed(2)}</div>
                  <div className={`text-xs ${analysis.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {analysis.changePercent >= 0 ? '▲' : '▼'} {Math.abs(analysis.changePercent).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={onReset}
                className={`px-4 py-2 ${bgTertiary} ${border} border rounded-lg font-medium hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'} transition-colors ${textSecondary}`}
              >
                New Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        
        {/* Signal Overview Card */}
        <div className={`${bgSecondary} rounded-2xl ${border} border overflow-hidden shadow-lg`}>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Score Gauge */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className={isDark ? 'text-slate-700' : 'text-gray-200'} />
                    <circle 
                      cx="96" cy="96" r="88" 
                      stroke="url(#scoreGradient)"
                      strokeWidth="12" 
                      fill="none" 
                      strokeDasharray={`${analysis.signal.score * 5.53} 553`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-5xl font-bold ${textPrimary}`}>{analysis.signal.score}</div>
                    <div className={`text-sm ${textMuted} mt-1`}>Signal Score</div>
                    <div className={`text-lg font-bold mt-1 bg-gradient-to-r ${getGradientForScore(analysis.signal.score)} bg-clip-text text-transparent`}>
                      {analysis.signal.grade}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signal Summary */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                    analysis.signal.direction === 'BULLISH' 
                      ? isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : isDark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {analysis.signal.direction} FORECAST
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-teal-100 text-teal-700 border border-teal-300'} text-sm font-semibold`}>
                    {analysis.signal.confidence} CONFIDENCE
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${bgTertiary} ${textSecondary} ${border} border text-sm`}>
                    {analysis.signal.timeHorizon}
                  </div>
                </div>

                <p className={`${textSecondary} leading-relaxed mb-4`}>
                  {analysis.signal.summary}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`${bgTertiary} rounded-lg p-3 ${border} border`}>
                    <div className={`text-xs ${textMuted} mb-1`}>Sharpe Ratio</div>
                    <div className="text-xl font-bold text-emerald-500">{analysis.signal.sharpeRatio}</div>
                    <div className={`text-xs ${textMuted}`}>Risk-adjusted return</div>
                  </div>
                  <div className={`${bgTertiary} rounded-lg p-3 ${border} border`}>
                    <div className={`text-xs ${textMuted} mb-1`}>Alpha</div>
                    <div className="text-xl font-bold text-teal-500">+{analysis.signal.alpha}%</div>
                    <div className={`text-xs ${textMuted}`}>Vs market performance</div>
                  </div>
                  <div className={`${bgTertiary} rounded-lg p-3 ${border} border`}>
                    <div className={`text-xs ${textMuted} mb-1`}>Beta</div>
                    <div className="text-xl font-bold text-yellow-500">{analysis.signal.beta}</div>
                    <div className={`text-xs ${textMuted}`}>Market sensitivity</div>
                  </div>
                  <div className={`${bgTertiary} rounded-lg p-3 ${border} border`}>
                    <div className={`text-xs ${textMuted} mb-1`}>Volatility (30d)</div>
                    <div className="text-xl font-bold text-orange-500">{analysis.signal.volatility}%</div>
                    <div className={`text-xs ${textMuted}`}>Annualized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart with Indicators */}
        <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>
            Price Chart with Technical Indicators
          </h3>
          <Plot
            data={[
              {
                x: dailyBars.map(b => b.date),
                open: dailyBars.map(b => b.open),
                high: dailyBars.map(b => b.high),
                low: dailyBars.map(b => b.low),
                close: dailyBars.map(b => b.close),
                type: 'candlestick',
                name: 'Price',
                increasing: { line: { color: '#10b981' } },
                decreasing: { line: { color: '#ef4444' } }
              },
              {
                x: dailyBars.map(b => b.date),
                y: sma50,
                type: 'scatter',
                mode: 'lines',
                name: 'SMA 50',
                line: { color: '#3b82f6', width: 2 }
              },
              {
                x: dailyBars.map(b => b.date),
                y: sma200,
                type: 'scatter',
                mode: 'lines',
                name: 'SMA 200',
                line: { color: '#8b5cf6', width: 2 }
              },
              {
                x: dailyBars.map(b => b.date),
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
              font: { color: isDark ? '#cbd5e1' : '#374151' },
              xaxis: {
                gridcolor: isDark ? '#334155' : '#e5e7eb',
                showgrid: true
              },
              yaxis: {
                gridcolor: isDark ? '#334155' : '#e5e7eb',
                showgrid: true,
                title: { text: 'Price' }
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
                y: -0.15
              },
              margin: { t: 20, b: 60 }
            }}
            config={{ displayModeBar: true, displaylogo: false }}
            style={{ width: '100%' }}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: '📊 Forecast Overview', desc: 'Signal breakdown & reasoning' },
            { id: 'scenarios', label: '🎯 Market Scenarios', desc: 'Probability-based predictions' },
            { id: 'analysis', label: '🔬 Deep Analysis', desc: 'Layer-by-layer metrics' },
            { id: 'risk', label: '⚠️ Risk Factors', desc: 'What to watch for' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : `${bgTertiary} ${textSecondary} hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'}`
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-[10px] opacity-70">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <Info className="w-5 h-5 text-emerald-500" />
                Statistical Model Breakdown
              </h3>
              <p className={`text-sm ${textMuted} mb-4`}>
                This score is calculated using multiple statistical models and technical indicators. Each component contributes to the final confidence score based on historical patterns and mathematical analysis.
              </p>
              <div className="space-y-3">
                {analysis.signal.reasoning.map((reason: string, i: number) => (
                  <div key={i} className={`flex items-start gap-3 p-3 ${bgTertiary} rounded-lg`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${textSecondary}`}>{reason}</p>
                  </div>
                ))}
              </div>
              <div className={`mt-4 pt-4 border-t ${borderLight}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className={textMuted}>Total Weighted Score:</span>
                  <span className="text-xl font-bold text-emerald-500">{analysis.signal.score} / 100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'scenarios' && (
          <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-emerald-500" />
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
              <div className={`text-sm font-semibold ${textPrimary} mb-3`}>🎯 Potential Upside Scenarios</div>
              <div className="space-y-3">
                {Object.entries(analysis.trade.targets).map(([key, target]: [string, any]) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12">
                      <div className={`text-xs ${textMuted}`}>{key.toUpperCase()}</div>
                      <div className="text-lg font-bold text-emerald-500">${target.price}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
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

        {activeSection === 'risk' && (
          <div className={`${bgSecondary} rounded-xl ${border} border p-6 shadow-lg`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Factors to Monitor
            </h3>
            <p className={`text-sm ${textMuted} mb-4`}>
              These are potential risk factors identified by the model. Monitoring these conditions can help inform decision-making.
            </p>
            <div className="space-y-3">
              {analysis.risks && analysis.risks.length > 0 ? analysis.risks.map((risk: any, i: number) => (
                <div key={i} className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      risk.severity === 'HIGH' ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700' :
                      risk.severity === 'MEDIUM' ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700' :
                      isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {risk.severity}
                    </div>
                    <h4 className={`text-sm font-semibold ${textPrimary} flex-1`}>{risk.title}</h4>
                  </div>
                  <p className={`text-sm ${textSecondary} mb-2`}>{risk.desc}</p>
                  <div className={`${isDark ? 'bg-slate-900/50' : 'bg-gray-50'} rounded p-2 border-l-2 border-emerald-500`}>
                    <p className={`text-xs ${textMuted}`}><span className="text-emerald-500 font-semibold">Consideration:</span> {risk.mitigation}</p>
                  </div>
                </div>
              )) : (
                <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                  <p className={`text-sm ${textSecondary}`}>No significant risk factors detected in current analysis.</p>
                </div>
              )}
            </div>
          </div>
        )}

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

          <div className={`text-center text-xs ${textMuted} pt-6 border-t ${borderLight}`}>
            <p>© 2025 Signal Intelligence Platform • Educational Use Only • Not a Registered Investment Advisor</p>
            <p className="mt-1">All trading and investing involves risk. You can lose money. Consult a professional before making financial decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}