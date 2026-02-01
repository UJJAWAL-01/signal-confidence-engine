'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

type Props = {
  onSelectStock: (symbol: string, name: string) => void;
  isDark?: boolean;
};

export default function GlobalStockSearch({ onSelectStock, isDark = true }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Theme
  const bg = isDark ? 'bg-slate-800' : 'bg-white';
  const bgHover = isDark ? 'bg-slate-700' : 'bg-gray-100';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-500';
  const border = isDark ? 'border-slate-700' : 'border-gray-200';

  // API search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 2) {
      setIsLoading(true);
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          
          setResults(data.results || []);
          setIsOpen(true);
          setHighlightedIndex(0);
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Wait 300ms after typing stops
    } else {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelectStock(result.symbol, result.name);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Get flag from symbol
  const getFlag = (symbol: string): string => {
    if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) return '🇮🇳';
    if (symbol.endsWith('.T')) return '🇯🇵';
    if (symbol.endsWith('.L')) return '🇬🇧';
    if (symbol.endsWith('.DE')) return '🇩🇪';
    if (symbol.endsWith('.PA')) return '🇫🇷';
    if (symbol.endsWith('.HK')) return '🇭🇰';
    if (symbol.endsWith('.TO')) return '🇨🇦';
    if (symbol.endsWith('.AX')) return '🇦🇺';
    return '🇺🇸';
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder="Search any stock worldwide (e.g., Apple, Reliance, Toyota)..."
          className={`w-full pl-10 pr-10 py-3 ${bg} ${border} border rounded-lg ${text} placeholder-${textMuted} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
        />
        
        {isLoading ? (
          <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted} animate-spin`} />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:${bgHover} rounded`}
          >
            <X className={`w-4 h-4 ${textMuted}`} />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className={`absolute top-full mt-2 w-full ${bg} ${border} border rounded-lg shadow-2xl max-h-[400px] overflow-y-auto z-50`}
        >
          {results.map((result, index) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left ${border} border-b last:border-0 transition-colors ${
                index === highlightedIndex ? bgHover : ''
              } hover:${bgHover} first:rounded-t-lg last:rounded-b-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getFlag(result.symbol)}</span>
                    <span className={`font-semibold ${text}`}>{result.symbol}</span>
                    <span className={`text-xs px-2 py-0.5 ${bg} ${border} border rounded ${textMuted}`}>
                      {result.exchange}
                    </span>
                  </div>
                  <div className={`text-sm ${textMuted}`}>{result.name}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div
          ref={dropdownRef}
          className={`absolute top-full mt-2 w-full ${bg} ${border} border rounded-lg shadow-xl p-6 text-center z-50`}
        >
          <div className="text-4xl mb-2">🔍</div>
          <p className={`${text} mb-1`}>No stocks found for "{query}"</p>
          <p className={`text-sm ${textMuted}`}>
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}