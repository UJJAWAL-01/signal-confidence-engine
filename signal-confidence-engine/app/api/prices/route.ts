// src/app/api/prices/route.ts
import { NextResponse } from "next/server";

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function parseStooqCsv(csvText: string): Bar[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Expected header: Date,Open,High,Low,Close,Volume
  const bars: Bar[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;

    const parts = row.split(",");
    if (parts.length < 6) continue;

    const [date, o, h, l, c, v] = parts;

    // Stooq sometimes uses "N/D" for missing
    if ([o, h, l, c, v].some((x) => x === "N/D")) continue;

    const open = Number(o);
    const high = Number(h);
    const low = Number(l);
    const close = Number(c);
    const volume = Number(v);

    if (![open, high, low, close, volume].every(Number.isFinite)) continue;

    bars.push({ date, open, high, low, close, volume });
  }

  return bars;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbolRaw = (url.searchParams.get("symbol") || "AAPL").trim();
  const intervalRaw = (url.searchParams.get("interval") || "d").trim().toLowerCase();

  // Stooq symbols for US equities: aapl.us, msft.us, spy.us
  const symbol = symbolRaw.toLowerCase().endsWith(".us")
    ? symbolRaw.toLowerCase()
    : `${symbolRaw.toLowerCase()}.us`;

  // Stooq intervals: d (daily), w (weekly), m (monthly)
  const interval = ["d", "w", "m"].includes(intervalRaw) ? intervalRaw : "d";

  const stooqUrl = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=${encodeURIComponent(interval)}`;

  try {
    const resp = await fetch(stooqUrl, {
      // Avoid caching during dev; later we can tune caching for production
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { ok: false, error: `Data fetch failed (${resp.status})`, symbol, interval },
        { status: 502 }
      );
    }

    const csvText = await resp.text();
    const bars = parseStooqCsv(csvText);

    if (bars.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No bars returned (invalid symbol or empty dataset).", symbol, interval },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, symbol, interval, bars });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error", symbol, interval },
      { status: 500 }
    );
  }
}
