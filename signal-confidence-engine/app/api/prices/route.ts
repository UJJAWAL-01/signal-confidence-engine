import { NextResponse } from "next/server";

type YahooBar = {
  timestamp: number[];
  indicators: {
    quote: {
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }[];
  };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "d";

  if (!symbol) {
    return NextResponse.json([]);
  }

  // Map interval
  const intervalMap: Record<string, string> = {
    d: "1d",
    w: "1wk",
    m: "1mo",
  };

  const yahooInterval = intervalMap[interval] || "1d";

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=2y`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Yahoo price fetch failed");
    }

    const data = await res.json();

    const result = data.chart?.result?.[0];
    if (!result) {
      return NextResponse.json([]);
    }

    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;

    const bars = timestamps.map((t: number, i: number) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i],
    })).filter(
      (b: any) =>
        b.open != null &&
        b.high != null &&
        b.low != null &&
        b.close != null
    );

    return NextResponse.json(bars);
  } catch (error) {
    console.error("API /prices error:", error);
    return NextResponse.json([]);
  }
}
