"use client";

import { useState, useEffect, useRef  } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Activity, Info, CheckCircle2, Sun, Moon, X, Search, BarChart3, AlertTriangle, Newspaper, Menu, HelpCircle, Loader2, Globe, ChevronDown } from 'lucide-react';
import { computeInstitutionalSignal, getMarketBenchmark } from '@/lib/institutionalEngine';
import { simpleMovingAverage, rsi } from '@/lib/indicators';
import DeepAnalysisTab from './DeepAnalysisTab';
import Tooltip from './Tooltip';
import AIInsights from './AIInsights';

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

// Countries/Regions for global search
const COUNTRIES = [
  { code: 'ALL', name: 'All Markets', flag: '🌍', currency: '' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: '$' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: '₹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: '¥' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: '£' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: '€' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: '€' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HK$' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'C$' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'A$' },
];

// API Search Result Type
type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

export default function CompleteTradingDashboard() {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchTerm, setSearchTerm] = useState('AAPL');
  // const [selectedCountry, setSelectedCountry] = useState('ALL');
  // const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interval, setInterval] = useState('d');
  const [dailyBars, setDailyBars] = useState<any[]>([]);
  const [weeklyBars, setWeeklyBars] = useState<any[]>([]);
  const [monthlyBars, setMonthlyBars] = useState<any[]>([]);
  const [marketBars, setMarketBars] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [activeTab, setActiveTab] = useState('analysis');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // NEW: API Search States
  const [apiSearchResults, setApiSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showApiResults, setShowApiResults] = useState(false);
  const searchTimeoutRef =  useRef<NodeJS.Timeout | null>(null);
  const filteredSymbols = POPULAR_SYMBOLS.filter(s => 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const companyName = POPULAR_SYMBOLS.find(s => s.symbol === symbol)?.name || 
                      apiSearchResults.find(s => s.symbol === symbol)?.name || 
                      symbol;

  // Load AAPL data on mount
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
  if (mobileMenuOpen) {
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  return () => {
    document.body.style.overflow = 'unset';
  };
}, [mobileMenuOpen]);

  // Normalize Indian stock prices
const normalizeIndianPrice = (price: number, symbol: string): number => {
  // Indian stocks on NSE/BSE
  if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) {
    // If price is suspiciously high (> 100000), it's probably in paise
    if (price > 100000) {
      return price / 100;
    }
    // Check if price seems too high compared to typical ranges
    // Most Indian stocks trade between ₹1 - ₹100,000
    // Anything > 500,000 is likely in paise format
    if (price > 500000) {
      return price / 100;
    }
  }
  return price;
};

  // Load data when symbol changes (but not on mount since we handle that above)
useEffect(() => {
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }



  if (searchTerm.length >= 2) {
    console.log('🔍 Searching for:', searchTerm);
    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        console.log('📦 Search results:', data.results);
        
        if (data.results && data.results.length > 0) {
          // Filter by country
          // let filtered = data.results;
          // if (selectedCountry !== 'ALL') {
          //   filtered = data.results.filter((r: SearchResult) => {
          //     if (selectedCountry === 'US') return !r.symbol.includes('.');
          //     if (selectedCountry === 'IN') return r.symbol.endsWith('.NS') || r.symbol.endsWith('.BO');
          //     if (selectedCountry === 'JP') return r.symbol.endsWith('.T');
          //     if (selectedCountry === 'GB') return r.symbol.endsWith('.L');
          //     if (selectedCountry === 'DE') return r.symbol.endsWith('.DE');
          //     if (selectedCountry === 'FR') return r.symbol.endsWith('.PA');
          //     if (selectedCountry === 'HK') return r.symbol.endsWith('.HK');
          //     if (selectedCountry === 'CA') return r.symbol.endsWith('.TO');
          //     if (selectedCountry === 'AU') return r.symbol.endsWith('.AX');
          //     return true;
          //   });
          // }
          
          // setApiSearchResults(filtered);
          // Show ALL results - no filtering
          setApiSearchResults(data.results || []);
          setShowApiResults(true);
          console.log('✅ Results shown');
        } else {
          setApiSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setApiSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);
  } else {
    setApiSearchResults([]);
    setShowApiResults(false);
    setIsSearching(false);
  }

  return () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };
}, [searchTerm]); // Add selectedCountry dependency!

// Click outside to close dropdowns
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowApiResults(false);
      // setShowCountryDropdown(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

// Get flag from symbol
const getFlag = (symbolStr: string): string => {
  if (symbolStr.endsWith('.NS') || symbolStr.endsWith('.BO')) return '🇮🇳';
  if (symbolStr.endsWith('.T')) return '🇯🇵';
  if (symbolStr.endsWith('.L')) return '🇬🇧';
  if (symbolStr.endsWith('.DE')) return '🇩🇪';
  if (symbolStr.endsWith('.PA')) return '🇫🇷';
  if (symbolStr.endsWith('.HK')) return '🇭🇰';
  if (symbolStr.endsWith('.TO')) return '🇨🇦';
  if (symbolStr.endsWith('.AX')) return '🇦🇺';
  return '🇺🇸';
};

// Get currency from symbol
const getCurrency = (symbolStr: string): string => {
  if (symbolStr.endsWith('.NS') || symbolStr.endsWith('.BO')) return '₹';
  if (symbolStr.endsWith('.T')) return '¥';
  if (symbolStr.endsWith('.L')) return '£';
  if (symbolStr.endsWith('.DE') || symbolStr.endsWith('.PA')) return '€';
  if (symbolStr.endsWith('.HK')) return 'HK$';
  if (symbolStr.endsWith('.TO')) return 'C$';
  if (symbolStr.endsWith('.AX')) return 'A$';
  return '$';
};

// Index symbol mappings
const INDEX_MAPPINGS: Record<string, string> = {
  // Indian Indexes
  'NIFTY': '^NSEI',
  'NIFTY50': '^NSEI',
  'SENSEX': '^BSESN',
  'BANKNIFTY': '^NSEBANK',
  'NIFTYBANK': '^NSEBANK',
  
  // US Indexes
  'NASDAQ': '^IXIC',
  'SPX': '^GSPC',
  'SP500': '^GSPC',
  'DOW': '^DJI',
  'DOWJONES': '^DJI',
  
  // Japanese Index
  'NIKKEI': '^N225',
  
  // UK Index
  'FTSE': '^FTSE',
  
  // German Index
  'DAX': '^GDAXI',
  
  // Hong Kong Index
  'HANGSENG': '^HSI',
  'HSI': '^HSI',
};

const currency = getCurrency(symbol);
// const currentCountry = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

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

    // NORMALIZE PRICES FOR INDIAN STOCKS
    const normalizeBars = (bars: any[]) => {
      if (!Array.isArray(bars)) return [];
      return bars.map(bar => ({
        ...bar,
        open: normalizeIndianPrice(bar.open, symbol),
        high: normalizeIndianPrice(bar.high, symbol),
        low: normalizeIndianPrice(bar.low, symbol),
        close: normalizeIndianPrice(bar.close, symbol),
      }));
    };

    setDailyBars(normalizeBars(daily));
    setWeeklyBars(normalizeBars(weekly));
    setMonthlyBars(normalizeBars(monthly));
    setMarketBars(Array.isArray(market) ? market : []);
    setNews(newsData?.news || []);

    const normalizedDaily = normalizeBars(daily);
    const normalizedWeekly = normalizeBars(weekly);
    const normalizedMonthly = normalizeBars(monthly);

    if (normalizedDaily.length && normalizedWeekly.length && normalizedMonthly.length && market.length) {
      const result = computeInstitutionalSignal(normalizedDaily, normalizedWeekly, normalizedMonthly, market);
      result.symbol = symbol;
      setAnalysis(result);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
};

//   const handleSymbolSelect = (sym: string, name?: string) => {
//   setSymbol(sym);
//   setSearchTerm('');
//   setShowSuggestions(false);
//   setShowApiResults(false);
//   setShowCountryDropdown(false);
  
//   // INSTANT load - no delay!
//   setLoading(true);
  
//   // Set symbol first, then load immediately
//   Promise.resolve().then(() => {
//     loadDataForSymbol(sym);
//   });
// };

const handleSymbolSelect = async (sym: string, name?: string) => {
  console.log(' handleSymbolSelect called with:', sym);

  const actualSymbol = INDEX_MAPPINGS[sym.toUpperCase()] || sym;
  console.log(' Actual symbol to load:', actualSymbol);

  // Immediately update UI
  setSymbol(actualSymbol);
  setSearchTerm('');
  setShowApiResults(false);
  setShowSuggestions(false);
  setLoading(true);
  
  try {
    // INSTANT LOAD - Fetch all data immediately
    const benchmark = getMarketBenchmark(actualSymbol);
    console.log(' Benchmark:', benchmark);

    const [dailyRes, weeklyRes, monthlyRes, marketRes, newsRes] = await Promise.all([
      fetch(`/api/prices?symbol=${actualSymbol}&interval=d`),
      fetch(`/api/prices?symbol=${actualSymbol}&interval=w`),
      fetch(`/api/prices?symbol=${actualSymbol}&interval=m`),
      fetch(`/api/prices?symbol=${benchmark}&interval=d`),
      fetch(`/api/news?symbol=${actualSymbol}`)
    ]);

    const daily = await dailyRes.json();
    const weekly = await weeklyRes.json();
    const monthly = await monthlyRes.json();
    const market = await marketRes.json();
    const newsData = await newsRes.json();

    console.log(' Data loaded successfully');

    const normalizeBars = (bars: any[]) => {
      if (!Array.isArray(bars)) return [];
      return bars.map(bar => ({
        ...bar,
        open: normalizeIndianPrice(bar.open, actualSymbol),
        high: normalizeIndianPrice(bar.high, actualSymbol),
        low: normalizeIndianPrice(bar.low, actualSymbol),
        close: normalizeIndianPrice(bar.close, actualSymbol),
      }));
    };

    setDailyBars(normalizeBars(daily));
    setWeeklyBars(normalizeBars(weekly));
    setMonthlyBars(normalizeBars(monthly));
    setMarketBars(Array.isArray(market) ? market : []);
    setNews(newsData?.news || []);

    const normalizedDaily = normalizeBars(daily);
    const normalizedWeekly = normalizeBars(weekly);
    const normalizedMonthly = normalizeBars(monthly);

    if (normalizedDaily.length && normalizedWeekly.length && normalizedMonthly.length && market.length) {
      const result = computeInstitutionalSignal(normalizedDaily, normalizedWeekly, normalizedMonthly, market);
      result.symbol = actualSymbol;
      setAnalysis(result);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
};

// const loadDataForSymbol = async (symbolToLoad: string = symbol) => {
//   setLoading(true);
//   try {
//     const [dailyRes, weeklyRes, monthlyRes, marketRes, newsRes] = await Promise.all([
//       fetch(`/api/prices?symbol=${symbolToLoad}&interval=d`),
//       fetch(`/api/prices?symbol=${symbolToLoad}&interval=w`),
//       fetch(`/api/prices?symbol=${symbolToLoad}&interval=m`),
//       fetch(`/api/prices?symbol=SPY&interval=d`),
//       fetch(`/api/news?symbol=${symbolToLoad}`)
//     ]);

//     const daily = await dailyRes.json();
//     const weekly = await weeklyRes.json();
//     const monthly = await monthlyRes.json();
//     const market = await marketRes.json();
//     const newsData = await newsRes.json();

//     setDailyBars(Array.isArray(daily) ? daily : []);
//     setWeeklyBars(Array.isArray(weekly) ? weekly : []);
//     setMonthlyBars(Array.isArray(monthly) ? monthly : []);
//     setMarketBars(Array.isArray(market) ? market : []);
//     setNews(newsData?.news || []);

//     if (daily.length && weekly.length && monthly.length && market.length) {
//       const result = computeInstitutionalSignal(daily, weekly, monthly, market);
//       result.symbol = symbolToLoad;
//       setAnalysis(result);
//     }
//   } catch (error) {
//     console.error('Error loading data:', error);
//   } finally {
//     setLoading(false);
//   }
// };

  // Allow any symbol to be searched
  const handleSearchSubmit = () => {
    const cleanSymbol = searchTerm.trim().toUpperCase();
    if (cleanSymbol) {
      setSymbol(cleanSymbol);
      setShowSuggestions(false);
      setShowApiResults(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // // Get flag from symbol
  // const getFlag = (symbolStr: string): string => {
  //   if (symbolStr.endsWith('.NS') || symbolStr.endsWith('.BO')) return '🇮🇳';
  //   if (symbolStr.endsWith('.T')) return '🇯🇵';
  //   if (symbolStr.endsWith('.L')) return '🇬🇧';
  //   if (symbolStr.endsWith('.DE')) return '🇩🇪';
  //   if (symbolStr.endsWith('.PA')) return '🇫🇷';
  //   if (symbolStr.endsWith('.HK')) return '🇭🇰';
  //   if (symbolStr.endsWith('.TO')) return '🇨🇦';
  //   if (symbolStr.endsWith('.AX')) return '🇦🇺';
  //   return '🇺🇸';
  // };

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
  const textPrimary = isDark ? 'text-slate-200' : 'text-gray-900';
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
          <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <p className={`text-xs md:text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
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
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4 md:gap-6">
            
            {/* Logo - Always Visible */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-sm md:text-base font-bold ${textPrimary}`}>
                  <span className="hidden sm:inline">Signal Intelligence Platform</span>
                  <span className="sm:hidden flex items-center gap-1">
                    <span className="text-lg">{getFlag(symbol)}</span>
                    {symbol}
                  </span>
                </h1>
                <p className={`text-[10px] md:text-xs ${textMuted} truncate max-w-[120px] md:max-w-none`}>
                  <span className="hidden sm:inline">Global Markets Analysis</span>
                  <span className="sm:hidden">{companyName.length > 20 ? companyName.substring(0, 20) + '...' : companyName}</span>
                </p>
              </div>
            </div>


            {/* Desktop Navigation - Hidden on Mobile */}
              <div className="hidden lg:flex flex-1 max-w-2xl" ref={dropdownRef}>
                <div className="relative w-full flex gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value.toUpperCase());
                      setShowSuggestions(true);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => {
                      setShowSuggestions(true);
                      if (apiSearchResults.length > 0) setShowApiResults(true);
                    }}
                    placeholder="Search stocks globally... (e.g., AAPL, RELIANCE.NS, 7203.T)"                    
                    className={`w-full pl-10 pr-10 py-3 ${bgTertiary} ${border} border rounded-lg ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                  {/* Loading Indicator */}
                  {isSearching && (
                    <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted} animate-spin`} />
                  )}
                  
                  {/* API Search Results Dropdown */}
                  {showApiResults && apiSearchResults.length > 0 && (
  <div className={`absolute top-full mt-2 w-full ${bgSecondary} ${border} border rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50`}>
    <div className={`px-4 py-2 ${bgTertiary} border-b ${border} sticky top-0 flex items-center gap-2`}>
      <Globe className={`w-4 h-4 ${textMuted}`} />
      <span className={`text-xs ${textMuted}`}>
        Found {apiSearchResults.length} result{apiSearchResults.length !== 1 ? 's' : ''}
      </span>
    </div>
    {apiSearchResults.map((result, idx) => (
      <button
        key={idx}
        onClick={() => handleSymbolSelect(result.symbol, result.name)}
        className={`w-full px-4 py-3 text-left hover:${bgTertiary} transition-colors border-b ${border} last:border-0 last:rounded-b-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getFlag(result.symbol)}</span>
              <span className={`font-semibold ${textPrimary}`}>{result.symbol}</span>
              <span className={`text-xs px-2 py-0.5 ${bgTertiary} rounded ${textMuted}`}>
                {result.exchange}
              </span>
            </div>
            <div className={`text-sm ${textSecondary}`}>{result.name}</div>
          </div>
        </div>
      </button>
    ))}
  </div>
)}
                  
                  {/* Popular Symbols Fallback */}
                  {showSuggestions && searchTerm && filteredSymbols.length > 0 && !showApiResults && (
                    <div className={`absolute top-full mt-2 w-full ${bgSecondary} ${border} border rounded-lg shadow-xl max-h-64 overflow-y-auto z-50`}>
                      <div className={`px-4 py-2 ${bgTertiary} border-b ${border}`}>
                        <p className={`text-xs ${textMuted}`}>💡Popular symbols</p>
                      </div>
                      {filteredSymbols.map(s => (
                        <button
                          key={s.symbol}
                          onClick={() => handleSymbolSelect(s.symbol, s.name)}
                          className={`w-full px-4 py-3 text-left hover:${bgTertiary} transition-colors border-b ${border} last:border-0`}
                        >
                          <div className={`font-semibold ${textPrimary}`}>{s.symbol}</div>
                          <div className={`text-sm ${textMuted}`}>{s.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                  title="Analyze this symbol"
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Desktop Controls - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-3">
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className={`px-4 py-2 ${bgTertiary} ${border} border rounded-lg ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <option value="d">Daily</option>
                <option value="w">Weekly</option>
                <option value="m">Monthly</option>
              </select>

              {/* <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:opacity-90 transition shadow-lg"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button> */}

              {/* Price Display */}
              <div className={`px-4 py-2 ${bgTertiary} rounded-lg ${border} border`}>
                <div className={`text-xs ${textMuted} flex items-center gap-1`}>
                  <span className="text-sm">{getFlag(symbol)}</span>
                  {symbol}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${textPrimary}`}>{currency}{currentPrice.toFixed(2)}</span>
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${bgTertiary} hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'} transition-colors`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

{/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="fixed inset-0 z-50 md:hidden">
    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
    
    <div ref={mobileDropdownRef} className={`absolute right-0 top-0 h-full w-80 ${bgSecondary} p-6 overflow-y-auto shadow-2xl`}>      
      {/* Close Button */}
      <button
        onClick={() => setMobileMenuOpen(false)}
        className={`absolute top-4 right-4 p-2 rounded-lg ${bgTertiary} hover:opacity-80`}
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>Menu</h2>

      {/* Mobile Search */}
      <div className="mb-6">
        <label className={`text-sm ${textMuted} mb-2 block`}>Search Symbol</label>
        <div className="relative">
          <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value.toUpperCase());
              // Don't close results on typing in mobile
            }}
            onFocus={() => {
            // Always allow search in mobile
            setShowSuggestions(true);
            }}
            placeholder="Search stocks..."
            className={`w-full pl-10 pr-4 py-3 ${bgTertiary} ${border} border rounded-lg ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            autoComplete="off"
          />
          
          {isSearching && (
            <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted} animate-spin`} />
          )}
        </div>

        {/* Mobile Search Results */}
        {/* {showApiResults && apiSearchResults.length > 0 && (
          <div className={`mt-2 ${bgTertiary} rounded-lg max-h-60 overflow-y-auto`}>
            <span className={`text-xs ${textMuted}`}>
              Found {apiSearchResults.length} result{apiSearchResults.length !== 1 ? 's' : ''}
            </span>
            {apiSearchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSymbolSelect(result.symbol, result.name)}
                className={`w-full px-4 py-3 text-left hover:${bgSecondary} transition-colors border-b ${border} last:border-0`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{getFlag(result.symbol)}</span>
                  <span className={`font-semibold ${textPrimary}`}>{result.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 ${bgTertiary} rounded ${textMuted}`}>
                    {result.exchange}
                  </span>
                </div>
                <div className={`text-xs ${textSecondary}`}>{result.name}</div>
              </button>
            ))}
          </div>
        )} */}

        {/* Mobile Search Results */}
{searchTerm.length >= 2 && apiSearchResults.length > 0 && (
  <div className={`mt-2 ${bgTertiary} rounded-lg max-h-60 overflow-y-auto shadow-lg`}>
    <div className={`px-4 py-2 ${bgSecondary} border-b ${border} sticky top-0`}>
      <span className={`text-xs ${textMuted}`}>
        Found {apiSearchResults.length} result{apiSearchResults.length !== 1 ? 's' : ''}
      </span>
    </div>
    {apiSearchResults.map((result, idx) => (
      <button
        key={idx}
        onClick={async () => {
          console.log(' Button clicked:', result.symbol);
          await handleSymbolSelect(result.symbol, result.name);
          setMobileMenuOpen(false);
          console.log(' Menu closed');
        }}
        className={`w-full px-4 py-3 text-left hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'} transition-colors border-b ${border} last:border-0 active:bg-emerald-100`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{getFlag(result.symbol)}</span>
          <span className={`font-semibold ${textPrimary}`}>{result.symbol}</span>
          <span className={`text-xs px-2 py-0.5 ${bgSecondary} rounded ${textMuted} border ${border}`}>
            {result.exchange}
          </span>
        </div>
        <div className={`text-xs ${textSecondary}`}>{result.name}</div>
      </button>
    ))}
  </div>
)}


        {/* No Results */}
        {showApiResults && !isSearching && searchTerm.length >= 2 && apiSearchResults.length === 0 && (
          <div className={`mt-2 ${bgTertiary} rounded-lg p-4 text-center`}>
            <p className={`text-sm ${textMuted}`}>No results for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Current Symbol Display */}
      {analysis && (
        <div className={`mb-6 p-4 ${bgTertiary} rounded-lg ${border} border`}>
          <div className={`text-xs ${textMuted} mb-1 flex items-center gap-1`}>
            <span className="text-base">{getFlag(symbol)}</span>
            Current Symbol
          </div>
          <div className={`text-xl font-bold ${textPrimary} mb-1`}>{symbol}</div>
          <div className={`text-lg font-semibold ${textPrimary}`}>
            {currency}{currentPrice.toFixed(2)}
          </div>
          <div className={`text-sm ${changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
          </div>
        </div>
      )}

      {/* Timeframe Selector */}
      <div className="mb-6">
        <label className={`text-sm ${textMuted} mb-2 block`}>Timeframe</label>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className={`w-full px-4 py-3 ${bgTertiary} ${border} border rounded-lg ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
        >
          <option value="d">Daily</option>
          <option value="w">Weekly</option>
          <option value="m">Monthly</option>
        </select>
      </div>

      {/* Refresh Button */}
      <button
        onClick={() => {
          loadData();
          setMobileMenuOpen(false);
        }}
        disabled={loading}
        className="w-full mb-6 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Refresh Data'}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`w-full p-3 rounded-lg ${bgTertiary} ${border} border flex items-center justify-between`}
      >
        <span className={textPrimary}>Theme</span>
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {/* Tab Navigation */}
<div className="mt-6 space-y-2">
  <button
    onClick={() => {
      setActiveTab('analysis');
      setMobileMenuOpen(false);
    }}
    className={`w-full p-3 rounded-lg text-left font-medium transition-colors ${
      activeTab === 'analysis' 
        ? 'bg-emerald-600 text-white' 
        : `${bgTertiary} ${textPrimary} hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'}`
    }`}
  >
    Technical Analysis
  </button>
  <button
    onClick={() => {
      setActiveTab('forecast');
      setMobileMenuOpen(false);
    }}
    className={`w-full p-3 rounded-lg text-left font-medium transition-colors ${
      activeTab === 'forecast' 
        ? 'bg-emerald-600 text-white' 
        : `${bgTertiary} ${textPrimary} hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'}`
    }`}
  >
    Forecast Overview
  </button>
  <button
    onClick={() => {
      setActiveTab('scenarios');
      setMobileMenuOpen(false);
    }}
    className={`w-full p-3 rounded-lg text-left font-medium transition-colors ${
      activeTab === 'scenarios' 
        ? 'bg-emerald-600 text-white' 
        : `${bgTertiary} ${textPrimary} hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'}`
    }`}
  >
    Market Scenarios
  </button>
</div>
    </div>
  </div>
)}

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Chart & Analysis */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Signal Score Card */}
            {analysis && (
              <div className={`${bgSecondary} rounded-xl ${border} border p-4 md:p-6 shadow-lg`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFlag(symbol)}</span>
                          <span
                            className={`text-lg sm:text-xl md:text-2xl font-semibold tracking-wide ${textPrimary}`}
                          >
                          {symbol}
                        </span>
                    </div>
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
    {/* Background circle */}
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      strokeWidth="8"
      className={isDark ? "stroke-slate-700" : "stroke-gray-200"}
    />

    {/* Progress circle */}
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      strokeWidth="8"
      stroke="url(#scoreGradient)"
      strokeDasharray={`${analysis.signal.score * 2.83} 283`}
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

  {/* Center content */}
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimary}`}>
      {analysis.signal.score}
    </div>
    <div className={`text-[10px] sm:text-xs ${textMuted}`}>
      Signal Score
    </div>
    <div
      className={`text-sm sm:text-base font-bold mt-0.5 bg-gradient-to-r ${getGradientForScore(
        analysis.signal.score
      )} bg-clip-text text-transparent`}
    >
      {analysis.signal.grade}
    </div>
  </div>
</div>
</div>

                  <div className="md:col-span-3 grid grid-cols-2 gap-4">
                    <div className={`${bgTertiary} rounded-lg p-3 md:p-4 ${border} border relative group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`text-xs ${textMuted}`}>Sharpe Ratio</div>
                            <Tooltip content="Measures risk-adjusted returns. Higher is better. Above 1 is good, above 2 is excellent. Shows return per unit of risk taken.">
                              <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                            </Tooltip>
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-emerald-500">{analysis.signal.sharpeRatio}</div>
                          <div className={`text-xs ${textMuted}`}>Risk-adjusted return</div>
                        </div>
                      </div>
                    </div>

                    <div className={`${bgTertiary} rounded-lg p-3 md:p-4 ${border} border relative group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`text-xs ${textMuted}`}>Alpha</div>
                            <Tooltip content="Excess return vs the market. Positive alpha means outperforming the market. Negative means underperforming.">
                              <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                            </Tooltip>
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-teal-500">{analysis.signal.alpha}%</div>
                          <div className={`text-xs ${textMuted}`}>Vs market</div>
                        </div>
                      </div>
                    </div>

                    <div className={`${bgTertiary} rounded-lg p-3 md:p-4 ${border} border relative group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`text-xs ${textMuted}`}>Beta</div>
                            <Tooltip content="Market sensitivity. Beta=1 moves with market. >1 more volatile. <1 less volatile. Measures correlation to overall market movements.">
                              <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                            </Tooltip>
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-yellow-500">{analysis.signal.beta}</div>
                          <div className={`text-xs ${textMuted}`}>Market sensitivity</div>
                        </div>
                      </div>
                    </div>

                    <div className={`${bgTertiary} rounded-lg p-3 md:p-4 ${border} border`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`text-xs ${textMuted}`}>Volatility (30d)</div>
                        <Tooltip content="Price fluctuation measure. Higher means more price swings. Lower means more stable. Annualized volatility over 30 days.">
                          <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                        </Tooltip>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-orange-500">{analysis.signal.volatility}%</div>
                      <div className={`text-xs ${textMuted}`}>Annualized</div>
                    </div>

                    <div className={`col-span-full ${bgTertiary} rounded-lg p-3 md:p-4 ${border} border`}>
                      <div className={`text-xs ${textMuted} mb-2`}>Forecast Summary</div>
                      <p className={`text-xs md:text-sm ${textSecondary}`}>{analysis.signal.summary}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            

            {/* Chart */}
            <div className={`${bgSecondary} rounded-xl ${border} border p-4 md:p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-base md:text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <span className="flex items-center gap-1">
                    <span className="text-base">{getFlag(symbol)}</span>
                    {symbol} Price Chart
                  </span>
                </h3>
                <span className={`text-sm font-normal ${textMuted}`}>
                  {interval === 'd' ? 'Daily' : interval === 'w' ? 'Weekly' : 'Monthly'} View
                </span>
              </div>
              
              {displayBars.length > 0 && (
              <div className="w-full overflow-x-auto">
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
                    height: 550,
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
                      title: { text: `Price (${currency})` }
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
                      width: 1400,
                      scale: 2
                    },
                    responsive: true
                  }}
                  style={{  width: '100%', minHeight: '550px'  }}
                  useResizeHandler={true}
                />
              </div>
              )}
            </div>

            {/* Tabs */}
            {analysis && (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { id: 'analysis', label: ' Technical Analysis', tooltip: 'Institutional metrics and advanced indicators' },
                    { id: 'overview', label: ' Forecast Overview', tooltip: 'Statistical breakdown and model reasoning' },
                    { id: 'scenarios', label: ' Market Scenarios', tooltip: 'Entry zones, targets, and risk levels' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.tooltip}
                      className={`min-w-fit max-w-full px-4 md:px-6 py-3 rounded-lg font-semibold 
                                  text-center break-words leading-tight transition-all text-sm md:text-base ${
                      activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : `${bgTertiary} ${textSecondary} hover:${isDark ? 'bg-slate-700' : 'bg-gray-200'}`
                      }`}
                      >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className={`${bgSecondary} rounded-xl ${border} border p-4 md:p-6 shadow-lg`}>
                  
                  {activeTab === 'analysis' && (
                    <DeepAnalysisTab
                      dailyBars={dailyBars}
                      weeklyBars={weeklyBars}
                      monthlyBars={monthlyBars}
                      marketBars={marketBars}
                      isDark={isDark}
                    />
                  )}
                  
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <h3 className={`text-base md:text-lg font-bold ${textPrimary} mb-4`}>Statistical Model Breakdown</h3>
                      {analysis.signal.reasoning.map((reason: string, i: number) => (
                        <div key={i} className={`flex items-start gap-3 p-3 ${bgTertiary} rounded-lg`}>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className={`text-sm ${textSecondary}`}>{reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'scenarios' && (
                    <div className={`${bgSecondary} rounded-xl ${border} border p-4 md:p-6 shadow-lg`}>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
                        <h3 className={`text-lg md:text-xl font-bold ${textPrimary}`}>Potential Market Scenarios</h3>
                        <div className={`ml-auto px-3 py-1 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} rounded-lg text-sm font-semibold border ${isDark ? 'border-emerald-500/30' : 'border-emerald-300'}`}>
                          <Tooltip content="Risk-to-Reward ratio. Higher means better potential return vs risk.">
                            <span className="cursor-help">R:R {analysis.trade.riskReward}:1</span>
                          </Tooltip>
                        </div>
                      </div>

                      <div className={`${isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'} border rounded-lg p-4 mb-6`}>
                        <p className={`text-xs md:text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                          <strong>Educational Forecast:</strong> These scenarios are statistical projections based on historical patterns and technical analysis. They represent possible outcomes, not predictions or recommendations.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                        <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`text-xs ${textMuted}`}>📍 Potential Entry Zones</div>
                            <Tooltip content="Suggested price levels to consider for positioning based on technical analysis">
                              <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                            </Tooltip>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-emerald-500 font-semibold">Primary Zone</div>
                              <div className={`text-xl md:text-2xl font-bold ${textPrimary}`}>{currency}{analysis.trade.entry.optimal}</div>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className={textMuted}>Aggressive:</span>
                              <span className={textSecondary}>{currency}{analysis.trade.entry.aggressive}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className={textMuted}>Conservative:</span>
                              <span className={textSecondary}>{currency}{analysis.trade.entry.conservative}</span>
                            </div>
                          </div>
                          <p className={`text-xs ${textMuted} mt-3`}>{analysis.trade.entry.reasoning}</p>
                        </div>

                        <div className={`${bgTertiary} rounded-lg p-4 border border-red-500/30`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`text-xs ${textMuted}`}>🛡️ Risk Level</div>
                            <Tooltip content="Suggested stop-loss level. If price reaches this level, it may signal the analysis is invalid.">
                              <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                            </Tooltip>
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-red-500 mb-1">{currency}{analysis.trade.stopLoss.price}</div>
                          <div className={`text-sm ${textSecondary} mb-3`}>{analysis.trade.stopLoss.percent}% potential decline</div>
                          <p className={`text-xs ${textMuted}`}>{analysis.trade.stopLoss.reasoning}</p>
                        </div>

                        <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`text-xs ${textMuted}`}>💰 Suggested Allocation</div>
                            <Tooltip content="Position sizing based on 2% risk management rule. Limits maximum loss to 2% of capital.">
                              <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                            </Tooltip>
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-emerald-500 mb-1">{analysis.trade.positionSize}</div>
                          <div className={`text-xs ${textSecondary} mb-3`}>Max risk: {analysis.trade.maxLoss}</div>
                          <div className={`text-xs ${textMuted}`}>Based on 2% risk management principle</div>
                        </div>
                      </div>

                      <div className={`${bgTertiary} rounded-lg p-4 ${border} border`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`text-sm font-semibold ${textPrimary}`}>🎯 Potential Upside Scenarios</div>
                          <Tooltip content="Price targets based on technical levels. Each has a probability based on historical patterns.">
                            <HelpCircle className={`w-4 h-4 ${textMuted} cursor-help`} />
                          </Tooltip>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(analysis.trade.targets).map(([key, target]: [string, any]) => (
                            <div key={key} className="flex flex-col md:flex-row md:items-center gap-10">
                              <div className="flex-shrink-0 w-full md:w-12">
                                <div className={`text-xs ${textMuted}`}>{key.toUpperCase()}</div>
                                <div className="text-base md:text-lg font-bold text-emerald-500">{currency}{target.price}</div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs md:text-sm ${textSecondary}`}>+{target.percent}% potential</span>
                                  <span className={`text-xs ${textMuted}`}>{target.probability}% probability</span>
                                </div>
                                <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                  <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                                    style={{ width: `${target.probability}%` }}
                                  />
                                </div>
                              </div>
                              <div className={`flex-shrink-0 text-xs ${textMuted} md:w-32`}>
                                {target.reasoning}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}


                </div>
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Technical Snapshot */}
            {analysis && (
              <div className={`${bgSecondary} rounded-xl ${border} border p-4 shadow-lg`}>
                <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Technical Snapshot
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
  <span className={`text-xs ${textMuted}`}>Last Price</span>
  <span className={`text-sm font-semibold ${textPrimary}`}>{currency}{currentPrice.toFixed(2)}</span>
</div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${textMuted}`}>SMA 50</span>
                      <Tooltip content="50-period moving average. Price above = bullish, below = bearish">
                        <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                      </Tooltip>
                    </div>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{currency}{sma50[sma50.length - 1]?.toFixed(2) || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${textMuted}`}>SMA 200</span>
                      <Tooltip content="200-period moving average. Long-term trend indicator">
                        <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                      </Tooltip>
                    </div>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{currency}{sma200[sma200.length - 1]?.toFixed(2) || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${textMuted}`}>RSI (14)</span>
                      <Tooltip content="Relative Strength Index. >70 overbought, <30 oversold, 50 neutral">
                        <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                      </Tooltip>
                    </div>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{rsi14[rsi14.length - 1]?.toFixed(1) || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${textMuted}`}>Volatility</span>
                      <Tooltip content="30-day annualized volatility. Higher = more price swings">
                        <HelpCircle className={`w-3 h-3 ${textMuted} cursor-help`} />
                      </Tooltip>
                    </div>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{analysis?.signal?.volatility}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* {analysis && (
              <AIInsights
                symbol={symbol}
                analysis={analysis}
                currentPrice={currentPrice}
                isDark={isDark}
              />
            )}     */}
            
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

            {/* Risk Factors (Mobile) */}
            {analysis?.risks && analysis.risks.length > 0 && (
              <div className={`${bgSecondary} rounded-xl ${border} border p-4 shadow-lg lg:hidden`}>
                <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Factors to Monitor
                </h3>
                <div className="space-y-2">
                  {analysis.risks.slice(0, 3).map((risk: any, i: number) => (
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
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4 md:p-6 ${border} border mb-6`}>
            <h4 className={`font-bold ${textPrimary} mb-3 text-sm md:text-base`}>⚠️ Important Disclaimer</h4>
            <div className={`text-xs md:text-sm ${textMuted} space-y-2`}>
              <p>
                <strong>Not Investment Advice:</strong> This platform is an educational tool for technical analysis and statistical forecasting. All information, predictions, scores, and scenarios are provided for informational and educational purposes only.
              </p>
              <p>
                <strong>No Professional Relationship:</strong> We are not registered investment advisors, brokers, or financial planners. Use of this tool does not create an advisory relationship. Always consult with a qualified financial professional before making investment decisions.
              </p>
              <p>
                <strong>No Guarantees:</strong> Past performance does not indicate future results. Technical analysis and statistical models have inherent limitations. Market conditions can change rapidly, and predictions may not materialize.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div>
              <h5 className={`font-semibold ${textPrimary} mb-2 text-sm md:text-base`}>What This Tool Does</h5>
              <ul className={`text-xs md:text-sm ${textMuted} space-y-1`}>
                <li>• Analyzes historical price patterns</li>
                <li>• Calculates technical indicators</li>
                <li>• Provides statistical forecasts</li>
                <li>• Shows risk/reward scenarios</li>
              </ul>
            </div>
            <div>
              <h5 className={`font-semibold ${textPrimary} mb-2 text-sm md:text-base`}>What This Tool Does NOT Do</h5>
              <ul className={`text-xs md:text-sm ${textMuted} space-y-1`}>
                <li>• Provide personalized advice</li>
                <li>• Guarantee future outcomes</li>
                <li>• Replace professional counsel</li>
                <li>• Manage your investments</li>
              </ul>
            </div>
            <div>
              <h5 className={`font-semibold ${textPrimary} mb-2 text-sm md:text-base`}>Metrics Used</h5>
              <ul className={`text-xs md:text-sm ${textMuted} space-y-1`}>
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