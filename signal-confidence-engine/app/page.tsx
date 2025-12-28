// src/app/page.tsx
export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Signal Confidence Engine</h1>
      <p style={{ marginTop: 8 }}>
        Milestone 1: Data API is live. Test it here:
      </p>

      <ol style={{ marginTop: 12, lineHeight: 1.8 }}>
        <li>
          AAPL daily:{" "}
          <a href="/api/prices?symbol=AAPL&interval=d" target="_blank" rel="noreferrer">
            /api/prices?symbol=AAPL&interval=d
          </a>
        </li>
        <li>
          SPY daily:{" "}
          <a href="/api/prices?symbol=SPY&interval=d" target="_blank" rel="noreferrer">
            /api/prices?symbol=SPY&interval=d
          </a>
        </li>
        <li>
          NVDA weekly:{" "}
          <a href="/api/prices?symbol=NVDA&interval=w" target="_blank" rel="noreferrer">
            /api/prices?symbol=NVDA&interval=w
          </a>
        </li>
      </ol>

      <p style={{ marginTop: 16, color: "#555" }}>
        Next milestone: chart + technical signals + confidence scoring.
      </p>
    </main>
  );
}
