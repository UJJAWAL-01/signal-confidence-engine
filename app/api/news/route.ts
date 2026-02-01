import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ news: [] });
  }

  try {
    // Determine which news source based on symbol
    let newsData = [];
    
    // For Indian stocks
    if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) {
      // Try Economic Times API or other Indian sources
      // For now, use Yahoo Finance but with company name search
      const companyName = symbol.replace('.NS', '').replace('.BO', '');
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${companyName}&newsCount=10`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store',
        }
      );
      const data = await res.json();
      newsData = data.news || [];
    } 
    // For Japanese stocks
    else if (symbol.endsWith('.T')) {
      const companyName = symbol.replace('.T', '');
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${companyName}&newsCount=10`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store',
        }
      );
      const data = await res.json();
      newsData = data.news || [];
    }
    // For US stocks (original method)
    else {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=5`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store',
        }
      );
      const data = await res.json();
      newsData = data.news || [];
    }

    const news = Array.isArray(newsData)
      ? newsData.map((n: any) => ({
          title: n.title,
          publisher: n.publisher,
          link: n.link,
        }))
      : [];

    return NextResponse.json({ news });
  } catch (error) {
    console.error('API /news error:', error);
    return NextResponse.json({ news: [] });
  }
}