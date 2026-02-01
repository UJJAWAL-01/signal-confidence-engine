"use client";

import { useState } from 'react';
import { Sparkles, Loader2, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

type AIInsightsProps = {
  symbol: string;
  analysis: any;
  currentPrice: number;
  isDark: boolean;
};

export default function AIInsights({ symbol, analysis, currentPrice, isDark }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');

  const bgSecondary = isDark ? 'bg-slate-900' : 'bg-white';
  const bgTertiary = isDark ? 'bg-slate-800' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-slate-200' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-gray-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-500';
  const border = isDark ? 'border-slate-700' : 'border-gray-200';

  const quickQuestions = [
    "Should I buy this stock now?",
    "What are the biggest risks?",
    "Is this stock overvalued?",
    "Compare this to the market average",
    "What's the best entry price?"
  ];

  const getAIInsights = async (userQuestion?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const prompt = userQuestion || `Analyze ${symbol} stock based on the following metrics:
        
Current Price: $${currentPrice}
Signal Score: ${analysis.signal.score} (${analysis.signal.grade})
Sharpe Ratio: ${analysis.signal.sharpeRatio}
Alpha: ${analysis.signal.alpha}%
Beta: ${analysis.signal.beta}
Volatility: ${analysis.signal.volatility}%

Recent Performance: ${analysis.signal.summary}

Provide a concise analysis in 3-4 sentences covering:
1. Overall assessment
2. Key strengths or concerns
3. Recommendation for consideration

Be direct and educational. Remember this is for learning purposes only, not financial advice.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI insights');
      }

      const data = await response.json();
      const aiResponse = data.content[0].text;
      setInsights(aiResponse);
    } catch (err) {
      console.error('AI Insights Error:', err);
      setError('Unable to generate AI insights at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = (q: string) => {
    setQuestion(q);
    getAIInsights(q);
  };

  return (
    <div className={`${bgSecondary} rounded-xl ${border} border p-4 md:p-6 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${textPrimary}`}>AI-Powered Insights</h3>
            <p className={`text-xs ${textMuted}`}>Powered by Claude AI</p>
          </div>
        </div>
        {!insights && !loading && (
          <button
            onClick={() => getAIInsights()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Generate Analysis
          </button>
        )}
      </div>

      {/* Quick Questions */}
      {!insights && !loading && (
        <div className="mb-4">
          <p className={`text-sm ${textMuted} mb-3`}>💡 Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => askQuestion(q)}
                className={`px-3 py-2 ${bgTertiary} rounded-lg text-xs ${textSecondary} hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'} transition-colors border ${border}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Question Input */}
      {!loading && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && question && getAIInsights(question)}
              placeholder="Ask AI anything about this stock..."
              className={`flex-1 px-4 py-2 ${bgTertiary} ${border} border rounded-lg ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            <button
              onClick={() => question && getAIInsights(question)}
              disabled={!question}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={`${bgTertiary} rounded-lg p-6 flex flex-col items-center justify-center`}>
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
          <p className={`text-sm ${textMuted}`}>AI is analyzing {symbol}...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`${isDark ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200'} border rounded-lg p-4 flex items-start gap-3`}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm ${isDark ? 'text-red-200' : 'text-red-800'} font-medium mb-1`}>
              AI Analysis Unavailable
            </p>
            <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              {error}
            </p>
            <button
              onClick={() => getAIInsights()}
              className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* AI Response */}
      {insights && !loading && (
        <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className={`text-xs ${textMuted} mb-1`}>
                {question || 'General Analysis'}
              </p>
              <div className={`text-sm ${textSecondary} leading-relaxed whitespace-pre-wrap`}>
                {insights}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className={`${isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'} border rounded-lg p-3 mt-4`}>
            <p className={`text-xs ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              ⚠️ <strong>Educational Only:</strong> This AI analysis is for learning purposes. Not financial advice. Always consult a professional before making investment decisions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setInsights('');
                setQuestion('');
              }}
              className={`flex-1 px-4 py-2 ${bgSecondary} ${border} border rounded-lg text-sm ${textSecondary} hover:${isDark ? 'bg-slate-800' : 'bg-gray-50'} transition-colors`}
            >
              Ask Another Question
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(insights);
                alert('Copied to clipboard!');
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Features List */}
      {!insights && !loading && !error && (
        <div className={`mt-4 p-4 ${bgTertiary} rounded-lg ${border} border`}>
          <p className={`text-xs font-semibold ${textPrimary} mb-2`}>What AI can help with:</p>
          <ul className={`text-xs ${textMuted} space-y-1`}>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              Interpret technical indicators in plain English
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              Identify potential risks and opportunities
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              Compare against market benchmarks
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              Explain complex metrics simply
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}