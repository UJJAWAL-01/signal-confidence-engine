import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ news: [] });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=5`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Yahoo fetch failed");
    }

    const data = await res.json();

    const news =
      Array.isArray(data.news)
        ? data.news.map((n: any) => ({
            title: n.title,
            publisher: n.publisher,
            link: n.link,
          }))
        : [];

    return NextResponse.json({ news });
  } catch (error) {
    console.error("API /news error:", error);
    return NextResponse.json({ news: [] });
  }
}
