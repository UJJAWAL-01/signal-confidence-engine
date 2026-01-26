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

type TransformedBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "d";

  if (!symbol) {
    return NextResponse.json([]);
  }

  // Map interval to Yahoo Finance format
  const intervalMap: Record<string, string> = {
    d: "1d",
    w: "1wk",
    m: "1mo",
  };

  const yahooInterval = intervalMap[interval] || "1d";

  // Determine range based on interval for better data coverage
  let range = "2y";
  if (interval === "w") range = "5y";
  if (interval === "m") range = "10y";

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=${range}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        cache: "no-store",
      }
    );

    const monthlyRes = await fetch(
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&range=5y`,
  {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  }
);

    if (!res.ok) {
      console.error(`Yahoo Finance API error: ${res.status} ${res.statusText}`);
      return NextResponse.json([]);
    }

    const data = await res.json();

    const result = data.chart?.result?.[0];
    if (!result) {
      console.error("No result data from Yahoo Finance");
      return NextResponse.json([]);
    }

    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;

    if (!timestamps || !quote) {
      console.error("Missing timestamps or quote data");
      return NextResponse.json([]);
    }

    // Transform bars to our format
    const bars: TransformedBar[] = timestamps
      .map((t: number, i: number) => ({
        date: new Date(t * 1000).toISOString().slice(0, 10),
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i],
      }))
      .filter(
        (b: TransformedBar) =>
          b.open != null &&
          b.high != null &&
          b.low != null &&
          b.close != null &&
          b.volume != null
      );

    // Return the bars array
    return NextResponse.json(bars);
    
  } catch (error) {
    console.error("API /prices error:", error);
    return NextResponse.json([]);
  }
}