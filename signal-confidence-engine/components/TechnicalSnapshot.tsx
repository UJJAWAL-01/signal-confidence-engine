type Props = {
  symbol: string;
  close: number;
  sma50?: number | null;
  sma200?: number | null;
  rsi?: number;
};

export default function TechnicalSnapshot({
  symbol,
  close,
  sma50,
  sma200,
  rsi,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-black">
        Technical Snapshot — {symbol}
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-black">
        <div>
          <span className="font-medium">Last Price</span>
          <div>{close.toFixed(2)}</div>
        </div>

        <div>
          <span className="font-medium">RSI (14)</span>
          <div>{rsi?.toFixed(1) ?? "—"}</div>
        </div>

        <div>
          <span className="font-medium">SMA 50</span>
          <div>{sma50 ? sma50.toFixed(2) : "—"}</div>
        </div>

        <div>
          <span className="font-medium">SMA 200</span>
          <div>{sma200 ? sma200.toFixed(2) : "—"}</div>
        </div>
      </div>
    </div>
  );
}
