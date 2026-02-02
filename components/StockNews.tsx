"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  publisher: string;
  link: string;
};

type Props = {
  symbol: string;
};

export default function StockNews({ symbol }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    async function loadNews() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/news?symbol=${symbol}`);

        const text = await res.text();

        // 🔒 Defensive check
        if (text.startsWith("<")) {
          throw new Error("HTML response received");
        }

        const data = JSON.parse(text);
        setNews(data.news || []);
      } catch (err) {
  if (process.env.NODE_ENV === 'development') {
    console.error("Client news error:", err);
  }
  setError("News temporarily unavailable");
  setNews([]);
} finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [symbol]);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-black">
        📰 Latest News — {symbol}
      </h3>

      {loading && (
        <p className="mt-2 text-sm text-black">Loading headlines…</p>
      )}

      {!loading && error && (
        <p className="mt-2 text-sm text-gray-600">{error}</p>
      )}

      {!loading && !error && news.length === 0 && (
        <p className="mt-2 text-sm text-gray-600">
          No recent news found.
        </p>
      )}

      <ul className="mt-2 space-y-2 text-sm text-black">
        {news.map((item, i) => (
          <li key={i}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              • {item.title}
            </a>
            <div className="text-xs text-gray-500">
              {item.publisher}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
