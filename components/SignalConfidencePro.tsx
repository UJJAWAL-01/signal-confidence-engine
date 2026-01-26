import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { computeAdvancedConfidence, type Bar, type ConfidenceResult } from '@/lib/advancedConfidenceEngine';

type Props = {
  symbol: string;
  dailyBars: Bar[];
  weeklyBars: Bar[];
  monthlyBars: Bar[];
  onBack?: () => void;
};

export default function SignalConfidencePro({ symbol, dailyBars, weeklyBars, monthlyBars, onBack }: Props) {
  const [analysisData, setAnalysisData] = useState<ConfidenceResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dailyBars.length && weeklyBars.length && monthlyBars.length) {
      setLoading(true);
      try {
        const result = computeAdvancedConfidence(dailyBars, weeklyBars, monthlyBars);
        setAnalysisData(result);
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [dailyBars, weeklyBars, monthlyBars]);

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'from-emerald-500 to-green-600',
      'A': 'from-green-500 to-emerald-500',
      'B': 'from-blue-500 to-cyan-500',
      'C': 'from-yellow-500 to-orange-500',
      'D': 'from-orange-500 to-red-500'
    };
    return colors[grade] || colors['C'];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getBiasIcon = (bias?: string) => {
    if (bias?.toLowerCase().includes('bullish')) return <TrendingUp className="w-5 h-5" />;
    if (bias?.toLowerCase().includes('bearish')) return <TrendingDown className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  if (loading || !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Analyzing {symbol} with advanced indicators...</p>
        </div>
      </div>
    );
  }

  const currentPrice = dailyBars[dailyBars.length - 1]?.close || 0;
  const prevPrice = dailyBars[dailyBars.length - 2]?.close || currentPrice;
  const change = currentPrice - prevPrice;
  const changePercent = (change / prevPrice) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Professional Signal Engine
              </h1>
              <p className="text-sm text-slate-400 mt-1">Institutional-grade technical analysis · {symbol}</p>
            </div>
            
            {onBack && (
              <button
                onClick={onBack}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg font-medium transition-all"
              >
                ← Back to Classic View
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Hero Section - Score Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Score */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl font-bold">{symbol}</span>
                      <span className={`text-lg ${changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${currentPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className={changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}% ({change >= 0 ? '+' : ''}{change.toFixed(2)})
                      </span>
                      <span>•</span>
                      <span>Confidence: {analysisData.confidence}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Primary Bias</div>
                    <div className="flex items-center gap-2">
                      {getBiasIcon(analysisData.bias)}
                      <span className="text-lg font-semibold">{analysisData.bias}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Signal Grade</div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${getGradeColor(analysisData.grade)} bg-clip-text text-transparent`}>
                      {analysisData.grade}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Circle */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${analysisData.finalScore * 5.53} 553`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold">{analysisData.finalScore}</div>
                    <div className="text-sm text-slate-400">Confidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {['overview', 'layers', 'timeframes', 'levels'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opportunities */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Opportunities</h3>
              </div>
              <div className="space-y-3">
                {analysisData.opportunities.map((opp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      opp.probability === 'High' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {opp.probability}
                    </div>
                    <p className="text-sm text-slate-300 flex-1">{opp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">Risk Factors</h3>
              </div>
              <div className="space-y-3">
                {analysisData.risks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      risk.level === 'High' ? 'bg-red-500/20 text-red-300' : 
                      risk.level === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {risk.level}
                    </div>
                    <p className="text-sm text-slate-300 flex-1">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(analysisData.layers).map(([layerName, layerData]) => (
              <div key={layerName} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{layerName}</h3>
                  <span className={`text-2xl font-bold ${getScoreColor(layerData.score)}`}>
                    {layerData.score}
                  </span>
                </div>
                <div className="space-y-3">
                  {layerData.components.map((comp, i) => (
                    <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comp.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          comp.signal === 'Bullish' ? 'bg-emerald-500/20 text-emerald-300' :
                          comp.signal === 'Bearish' ? 'bg-red-500/20 text-red-300' :
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {comp.signal}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{comp.description}</p>
                      <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${comp.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'timeframes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analysisData.timeframes).map(([tf, data]) => (
              <div key={tf} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-center">
                  <h3 className="text-lg font-semibold capitalize mb-4">{tf}</h3>
                  <div className={`text-5xl font-bold mb-2 ${getScoreColor(data.score)}`}>
                    {data.score}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {getBiasIcon(data.bias)}
                    <span className="text-sm text-slate-300">{data.bias}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Trend: <span className="text-slate-200">{data.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'levels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-400" />
                Resistance Levels
              </h3>
              <div className="space-y-2">
                {analysisData.keyLevels.resistance.map((level, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-sm text-slate-400">R{i + 1}</span>
                    <span className="font-mono font-semibold text-red-300">${level.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                Support Levels
              </h3>
              <div className="space-y-2">
                {analysisData.keyLevels.support.map((level, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <span className="text-sm text-slate-400">S{i + 1}</span>
                    <span className="font-mono font-semibold text-emerald-300">${level.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}