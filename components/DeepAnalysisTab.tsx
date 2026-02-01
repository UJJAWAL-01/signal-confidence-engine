"use client";

import { useState, useEffect } from 'react';
import { Info, TrendingUp, TrendingDown, Activity, Zap, Target, BarChart3, Users, Shield, Calendar } from 'lucide-react';
import { computeAdvancedInstitutionalAnalysis, type InstitutionalAnalysis, type Bar } from '@/lib/advancedInstitutionalEngine';

type Props = {
  dailyBars: Bar[];
  weeklyBars: Bar[];
  monthlyBars: Bar[];
  marketBars: Bar[];
  isDark?: boolean;
};

export default function DeepAnalysisTab({ dailyBars, weeklyBars, monthlyBars, marketBars, isDark = true }: Props) {
  const [analysis, setAnalysis] = useState<InstitutionalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    if (dailyBars.length && weeklyBars.length && monthlyBars.length && marketBars.length) {
      try {
        const result = computeAdvancedInstitutionalAnalysis(dailyBars, weeklyBars, monthlyBars, marketBars);
        setAnalysis(result);
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [dailyBars, weeklyBars, monthlyBars, marketBars]);

  // Theme classes
  const bgPrimary = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-slate-900' : 'bg-white';
  const bgTertiary = isDark ? 'bg-slate-800' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-gray-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-500';
  const border = isDark ? 'border-slate-700' : 'border-gray-200';

  const getScoreColor = (score: number) => {
    if (score >= 70) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (score >= 50) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return isDark ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-100 border-emerald-300';
    if (score >= 50) return isDark ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-100 border-yellow-300';
    return isDark ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={textMuted}>Computing institutional-grade analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <p className={textMuted}>Unable to compute analysis. Please ensure sufficient data is available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header with Explanation */}
      <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className={`text-lg font-bold ${textPrimary} mb-2`}>
              In-Depth Technical Analysis
            </h3>
            <p className={`text-sm ${textSecondary} mb-3`}>
              This section provides advanced quantitative analysis using institutional-level metrics typically employed by hedge funds and professional traders. Each metric has been carefully selected to provide actionable insights into market dynamics, order flow, and price behavior.
            </p>
            <div className={`${isDark ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
              <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>How to use:</strong> Click on any metric card to see detailed explanations and interpretations. Higher scores (70+) indicate favorable conditions, while lower scores suggest caution or inverse strategies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Flow Analysis */}
      <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-emerald-500" />
          <h3 className={`text-xl font-bold ${textPrimary}`}>Order Flow Analysis</h3>
          <div className={`ml-auto px-4 py-2 rounded-lg border ${getScoreBg(analysis.orderFlow.score)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(analysis.orderFlow.score)}`}>
              {analysis.orderFlow.score}
            </span>
          </div>
        </div>

        <p className={`text-sm ${textMuted} mb-4`}>
          <strong>What it measures:</strong> Order flow analysis examines the actual buying and selling pressure in the market by analyzing volume-weighted prices, order imbalances, and cumulative delta. This helps identify institutional accumulation or distribution patterns.
        </p>

        <div className={`${bgTertiary} rounded-lg p-4 mb-4`}>
          <div className={`flex items-center gap-2 mb-2`}>
            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
              analysis.orderFlow.signal === 'BULLISH' ? 
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' :
              analysis.orderFlow.signal === 'BEARISH' ?
                isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700' :
                isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {analysis.orderFlow.signal}
            </span>
          </div>
          <p className={`text-sm ${textSecondary}`}>{analysis.orderFlow.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.orderFlow.components.map((component, index) => (
            <div 
              key={index} 
              className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4 cursor-pointer hover:${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} transition-colors`}
              onClick={() => setSelectedMetric(selectedMetric === component.name ? null : component.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-semibold ${textPrimary}`}>{component.name}</h4>
                <span className={`text-lg font-bold ${getScoreColor(component.value)}`}>
                  {component.value}
                </span>
              </div>
              <p className={`text-xs ${textMuted} mb-2`}>{component.description}</p>
              {selectedMetric === component.name && (
                <div className={`mt-3 pt-3 border-t ${border}`}>
                  <p className={`text-xs ${textSecondary}`}>
                    <strong>Interpretation:</strong> {component.interpretation}
                  </p>
                </div>
              )}
              <div className={`mt-2 h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${component.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Microstructure */}
      <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className={`text-xl font-bold ${textPrimary}`}>Market Microstructure</h3>
          <div className={`ml-auto px-4 py-2 rounded-lg border ${getScoreBg(analysis.marketMicrostructure.score)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.marketMicrostructure?.score || 0)}`}>
              {analysis.marketMicrostructure?.priceImpact || 'N/A'}
            </div>
          </div>
        </div>
        
        

        <p className={`text-sm ${textMuted} mb-4`}>
          <strong>What it measures:</strong> Market microstructure examines the mechanics of how trades are executed, including bid-ask spreads, market depth, and price impact. This helps assess trading costs and market efficiency.
        </p>

        <div className={`${bgTertiary} rounded-lg p-4 mb-4`}>
          <p className={`text-sm ${textSecondary}`}>{analysis.marketMicrostructure.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Bid-Ask Spread</div>
            <div className={`text-2xl font-bold ${textPrimary}`}>{analysis.marketMicrostructure.bidAskSpread}%</div>
            <p className={`text-xs ${textMuted} mt-2`}>Lower is better - indicates tighter spreads and better liquidity</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Market Depth</div>
            <div className={`text-2xl font-bold ${textPrimary}`}>{analysis.marketMicrostructure.marketDepth}</div>
            <p className={`text-xs ${textMuted} mt-2`}>Volume concentration - higher means more volatile order book</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Price Impact</div>
            <div className={`text-2xl font-bold ${textPrimary}`}>{analysis.marketMicrostructure.priceImpact}</div>
            <p className={`text-xs ${textMuted} mt-2`}>Cost of moving price - lower indicates better liquidity</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Info Asymmetry</div>
            <div className={`text-2xl font-bold ${textPrimary}`}>{analysis.marketMicrostructure.informationAsymmetry}</div>
            <p className={`text-xs ${textMuted} mt-2`}>Market efficiency - lower means more efficient price discovery</p>
          </div>
        </div>
      </div>

      {/* Market Regime Detection */}
      <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-purple-500" />
          <h3 className={`text-xl font-bold ${textPrimary}`}>Market Regime Detection</h3>
          <div
  className={`ml-auto inline-flex items-center px-3 py-1.5 rounded-md border 
  ${isDark 
    ? 'bg-purple-500/20 border-purple-500/30' 
    : 'bg-purple-100 border-purple-300'
  }`}
>
  <span
    className={`text-sm font-semibold tracking-wide leading-none text-center
    ${isDark ? 'text-purple-400' : 'text-purple-700'}`}
  >
    {analysis.regimeDetection.currentRegime}
  </span>
</div>

        </div>

        <p className={`text-sm ${textMuted} mb-4`}>
          <strong>What it measures:</strong> Regime detection identifies the current market state (trending, mean-reverting, volatile, or quiet) to help you choose the right trading strategy. Different regimes require different approaches.
        </p>

        <div className={`${bgTertiary} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${textSecondary}`}>Detection Confidence</span>
            <span className={`text-lg font-bold ${textPrimary}`}>{analysis.regimeDetection.confidence}%</span>
          </div>
          <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${analysis.regimeDetection.confidence}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Trend Strength</div>
            <div className={`text-2xl font-bold ${textPrimary} mb-2`}>{analysis.regimeDetection.trendStrength}</div>
            <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{ width: `${analysis.regimeDetection.trendStrength}%` }}
              />
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Mean Reversion Score</div>
            <div className={`text-2xl font-bold ${textPrimary} mb-2`}>{analysis.regimeDetection.meanReversionScore}</div>
            <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${analysis.regimeDetection.meanReversionScore}%` }}
              />
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Volatility Regime</div>
            <div className={`text-2xl font-bold ${textPrimary}`}>{analysis.regimeDetection.volatilityRegime}</div>
            <div className={`text-xs ${textMuted} mt-2`}>
              {analysis.regimeDetection.volatilityRegime === 'HIGH' ? 'Increased risk - reduce size' :
               analysis.regimeDetection.volatilityRegime === 'LOW' ? 'Low risk - good for entries' :
               'Normal volatility'}
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <h4 className={`text-sm font-semibold ${textPrimary} mb-2`}>Strategy Recommendations:</h4>
          <ul className="space-y-2">
            {analysis.regimeDetection.recommendations.map((rec, index) => (
              <li key={index} className={`flex items-start gap-2 text-sm ${textSecondary}`}>
                <span className="text-emerald-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Volatility Surface */}
      <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-orange-500" />
          <h3 className={`text-xl font-bold ${textPrimary}`}>Volatility Surface Analysis</h3>
        </div>

        <p className={`text-sm ${textMuted} mb-4`}>
          <strong>What it measures:</strong> Volatility surface analysis examines realized volatility across different timeframes and compares it to implied volatility. This helps identify mispricings and potential options opportunities.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Realized Vol</div>
            <div className={`text-2xl font-bold text-orange-500`}>{analysis.volatilitySurface.realizedVol}%</div>
            <p className={`text-xs ${textMuted} mt-2`}>Historical volatility (20-day)</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Implied Vol</div>
            <div className={`text-2xl font-bold text-purple-500`}>{analysis.volatilitySurface.impliedVol}%</div>
            <p className={`text-xs ${textMuted} mt-2`}>Forward-looking volatility estimate</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Vol of Vol</div>
            <div className={`text-2xl font-bold text-yellow-500`}>{analysis.volatilitySurface.volOfVol}%</div>
            <p className={`text-xs ${textMuted} mt-2`}>Volatility uncertainty</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Skew</div>
            <div className={`text-2xl font-bold text-red-500`}>{analysis.volatilitySurface.skew}</div>
            <p className={`text-xs ${textMuted} mt-2`}>
              {analysis.volatilitySurface.skew < -0.5 ? 'Put premium' : 
               analysis.volatilitySurface.skew > 0.5 ? 'Call premium' : 'Balanced'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {analysis.volatilitySurface.components.map((comp, index) => (
            <div key={index} className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${textPrimary}`}>{comp.name}</span>
                <span className={`text-lg font-bold ${textPrimary}`}>{comp.value}%</span>
              </div>
              <p className={`text-xs ${textMuted} mt-1`}>{comp.interpretation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Money Indicators */}
      <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-cyan-500" />
          <h3 className={`text-xl font-bold ${textPrimary}`}>Smart Money Indicators</h3>
          <div className={`ml-auto px-4 py-2 rounded-lg border ${getScoreBg(analysis.smartMoneyIndicators.score)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(analysis.smartMoneyIndicators.score)}`}>
              {analysis.smartMoneyIndicators.score}
            </span>
          </div>
        </div>

        <p className={`text-sm ${textMuted} mb-4`}>
          <strong>What it measures:</strong> Smart money indicators track institutional activity using Wyckoff methodology, composite indexes, and volume patterns to identify accumulation or distribution by sophisticated investors.
        </p>

        <div className={`${bgTertiary} rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
              analysis.smartMoneyIndicators.signal === 'ACCUMULATION' ?
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' :
              analysis.smartMoneyIndicators.signal === 'DISTRIBUTION' ?
                isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700' :
                isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {analysis.smartMoneyIndicators.signal}
            </span>
          </div>
          <p className={`text-sm ${textSecondary}`}>{analysis.smartMoneyIndicators.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Wyckoff Phase</div>
            <div className={`text-xl font-bold ${textPrimary}`}>{analysis.smartMoneyIndicators.components.wyckoffPhase}</div>
            <p className={`text-xs ${textMuted} mt-2`}>Current market cycle phase</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Composite Index</div>
            <div className={`text-xl font-bold ${textPrimary}`}>{analysis.smartMoneyIndicators.components.compositeIndex}</div>
            <p className={`text-xs ${textMuted} mt-2`}>Money flow strength</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Institutional Activity</div>
            <div className={`text-xl font-bold ${textPrimary}`}>{analysis.smartMoneyIndicators.components.institutionalActivity}%</div>
            <p className={`text-xs ${textMuted} mt-2`}>Large volume bars frequency</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-xs ${textMuted} mb-1`}>Dark Pool Activity</div>
            <div className={`text-xl font-bold ${textPrimary}`}>{analysis.smartMoneyIndicators.components.darkPoolActivity}%</div>
            <p className={`text-xs ${textMuted} mt-2`}>Off-exchange trading proxy</p>
          </div>
        </div>
      </div>

      {/* Liquidity & Correlation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Liquidity Analysis */}
        <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-teal-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Liquidity Analysis</h3>
            <div className={`ml-auto px-3 py-1 rounded-lg border ${getScoreBg(analysis.liquidityAnalysis.score)}`}>
              <span className={`text-xl font-bold ${getScoreColor(analysis.liquidityAnalysis.score)}`}>
                {analysis.liquidityAnalysis.score}
              </span>
            </div>
          </div>

          <p className={`text-xs ${textMuted} mb-3`}>
            Liquidity measures how easily you can enter/exit positions without moving price significantly.
          </p>

          <div className={`${bgTertiary} rounded-lg p-3 mb-3`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${textMuted}`}>Liquidity Risk</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                analysis.liquidityAnalysis.liquidityRisk === 'LOW' ?
                  isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' :
                analysis.liquidityAnalysis.liquidityRisk === 'HIGH' ?
                  isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700' :
                  isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {analysis.liquidityAnalysis.liquidityRisk}
              </span>
            </div>
            <p className={`text-xs ${textSecondary}`}>{analysis.liquidityAnalysis.description}</p>
          </div>

          <div className="space-y-2">
            <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-3`}>
              <div className={`text-xs ${textMuted} mb-1`}>Amihud Illiquidity</div>
              <div className={`text-lg font-bold ${textPrimary}`}>{analysis.liquidityAnalysis.amihudIlliquidity}</div>
              <p className={`text-xs ${textMuted}`}>Lower = better liquidity</p>
            </div>
            <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-3`}>
              <div className={`text-xs ${textMuted} mb-1`}>Point of Control (POC)</div>
              <div className={`text-lg font-bold ${textPrimary}`}>${analysis.liquidityAnalysis.volumeProfile.poc}</div>
              <p className={`text-xs ${textMuted}`}>Price with highest volume</p>
            </div>
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-pink-500" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Correlation Analysis</h3>
          </div>

          <p className={`text-xs ${textMuted} mb-3`}>
            Measures how this stock moves relative to the broader market - important for diversification.
          </p>

          <div className="space-y-3">
            <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${textPrimary}`}>Market Correlation</span>
                <span className={`text-2xl font-bold ${textPrimary}`}>{analysis.correlationMatrix.marketCorrelation}</span>
              </div>
              <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  style={{ width: `${Math.abs(analysis.correlationMatrix.marketCorrelation) * 100}%` }}
                />
              </div>
              <p className={`text-xs ${textMuted} mt-2`}>
                {Math.abs(analysis.correlationMatrix.marketCorrelation) > 0.7 ? 'Strong correlation' :
                 Math.abs(analysis.correlationMatrix.marketCorrelation) < 0.3 ? 'Independent behavior' :
                 'Moderate correlation'}
              </p>
            </div>

            <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${textPrimary}`}>Sector Correlation</span>
                <span className={`text-2xl font-bold ${textPrimary}`}>{analysis.correlationMatrix.sectorCorrelation}</span>
              </div>
              <p className={`text-xs ${textMuted}`}>Long-term sector relationship</p>
            </div>

            <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${textPrimary}`}>Beta Stability</span>
                <span className={`text-2xl font-bold ${textPrimary}`}>{analysis.correlationMatrix.betaStability}</span>
              </div>
              <p className={`text-xs ${textMuted}`}>Higher = more predictable relationship</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonality Patterns */}
      <div className={`${bgSecondary} rounded-xl ${border} border p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-indigo-500" />
          <h3 className={`text-xl font-bold ${textPrimary}`}>Seasonality Patterns</h3>
        </div>

        <p className={`text-sm ${textMuted} mb-4`}>
          <strong>What it measures:</strong> Seasonality analysis identifies recurring patterns based on time of week, month, or quarter. These patterns can provide edge when timing entries and exits.
        </p>

        <div className={`${bgTertiary} rounded-lg p-4 mb-4`}>
          <p className={`text-sm ${textSecondary}`}>{analysis.seasonalityPatterns.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {Object.entries(analysis.seasonalityPatterns.dayOfWeek).map(([day, value]) => (
            <div key={day} className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-3 text-center`}>
              <div className={`text-xs ${textMuted} mb-1`}>{day.slice(0, 3)}</div>
              <div className={`text-lg font-bold ${value > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {value > 0 ? '+' : ''}{value}%
              </div>
            </div>
          ))}
        </div>

        <div className={`${isDark ? 'bg-indigo-900/20 border-indigo-700/30' : 'bg-indigo-50 border-indigo-200'} border rounded-lg p-4`}>
          <p className={`text-sm ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
            <strong>Quarterly Pattern:</strong> {analysis.seasonalityPatterns.quarterlyPattern}
          </p>
        </div>
      </div>

    </div>
  );
}