import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');


  if (!query || query.length < 2) {
    return NextResponse.json({ 
      error: 'Query too short',
      results: [] 
    });
  }

  try {
    // Yahoo Finance Search API (FREE!)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    

    // Format results
    const results = (data.quotes || [])
      .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || q.exchange,
        type: q.quoteType,
      }));

    return NextResponse.json({ 
      query,
      count: results.length,
      results 
    });

  } catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Search API error:', error);
  }
  return NextResponse.json({ 
    error: 'Search failed',
    results: [] 
  }, { status: 500 });
}
}
