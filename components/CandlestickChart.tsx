// "use client";

// import { useState } from "react";
// import dynamic from "next/dynamic";
// import { simpleMovingAverage, rsi } from "@/lib/indicators";

// import ConfidenceBreakdown from "./ConfidenceBreakdown";
// import { fibonacciPivots as computeFibonacciPivots } from "@/lib/fibonacci";
// import TechnicalSnapshot from "./TechnicalSnapshot";
// import StockNews from "./StockNews";

// // Dynamically import Pro view
// const SignalConfidencePro = dynamic(() => import("./SignalConfidencePro"), { ssr: false });

// // Updated fibLine function to ensure compatibility with Plotly types
// function fibLine(name: string, level: number, dates: string[]): Partial<Plotly.Data> {
//   return {
//     x: dates,
//     y: dates.map(() => level),
//     type: "scatter",
//     mode: "lines",
//     name,
//     line: {
//       dash: "dot" as Plotly.Dash,
//       width: 1,
//     },
//   };
// }

// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// type Bar = {
//   date: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
// };

// type Props = {
//   symbol: string;
//   bars: Bar[];
//   weeklyBars?: Bar[];
//   monthlyBars?: Bar[];
//   interval: string;
// };

// export default function CandlestickChart({
//   symbol,
//   bars,
//   weeklyBars = [],
//   monthlyBars = [],
//   interval = "d",
// }: Props) {
//   const [viewMode, setViewMode] = useState<'classic' | 'pro'>('classic');

//   // Safety check
//   if (!Array.isArray(bars) || bars.length === 0) {
//     return (
//       <div className="p-8 text-center text-gray-500">
//         <p>No data available to display chart.</p>
//       </div>
//     );
//   }

//   // Check if we have enough data for Pro mode
//   const hasEnoughDataForPro = bars.length >= 100 && weeklyBars.length >= 60 && monthlyBars.length >= 60;

//   // If Pro mode selected and we have enough data, show Pro view
//   if (viewMode === 'pro' && hasEnoughDataForPro) {
//     return (
//       <SignalConfidencePro
//         symbol={symbol}
//         dailyBars={bars}
//         weeklyBars={weeklyBars}
//         monthlyBars={monthlyBars}
//         onBack={() => setViewMode('classic')}
//       />
//     );
//   }

//   // Classic view code below...
//   let displayBars: Bar[] = bars;
//   let timeframeName = "Daily";
  
//   if (interval === "w" && weeklyBars.length > 0) {
//     displayBars = weeklyBars;
//     timeframeName = "Weekly";
//   } else if (interval === "m" && monthlyBars.length > 0) {
//     displayBars = monthlyBars;
//     timeframeName = "Monthly";
//   }

//   const displayCloses = displayBars.map((b) => b.close);
//   const displaySma50 = simpleMovingAverage(displayCloses, 50);
//   const displaySma200 = simpleMovingAverage(displayCloses, 200);
//   const displayRsi14 = rsi(displayCloses.filter((close) => close !== null), 14);

//   const displayConfidence = computeConfidence({
//     bars: displayBars,
//     closes: displayCloses,
//     sma50: displaySma50,
//     sma200: displaySma200,
//     rsi14: displayRsi14,
//   });

//   const dailyCloses = bars.map((b) => b.close);
//   const dailySma50 = simpleMovingAverage(dailyCloses, 50);
//   const dailySma200 = simpleMovingAverage(dailyCloses, 200);
//   const dailyRsi14 = rsi(dailyCloses.filter((close) => close !== null), 14);
  
//   const daily = computeConfidence({
//     bars,
//     closes: dailyCloses,
//     sma50: dailySma50,
//     sma200: dailySma200,
//     rsi14: dailyRsi14,
//   });

//   let weekly = null;
//   if (weeklyBars && weeklyBars.length > 60) {
//     const wCloses = weeklyBars.map((b) => b.close);
//     weekly = computeConfidence({
//       bars: weeklyBars,
//       closes: wCloses,
//       sma50: simpleMovingAverage(wCloses, 50),
//       sma200: simpleMovingAverage(wCloses, 200),
//       rsi14: rsi(wCloses.filter((close) => close !== null), 14),
//     });
//   }

//   let monthly = null;
//   if (monthlyBars && monthlyBars.length > 60) {
//     const mCloses = monthlyBars.map((b) => b.close);
//     monthly = computeConfidence({
//       bars: monthlyBars,
//       closes: mCloses,
//       sma50: simpleMovingAverage(mCloses, 50),
//       sma200: simpleMovingAverage(mCloses, 200),
//       rsi14: rsi(mCloses.filter((close) => close !== null), 14),
//     });
//   }

//   const prevBar = displayBars[displayBars.length - 2];
//   const fib = prevBar 
//     ? computeFibonacciPivots(prevBar.high, prevBar.low, prevBar.close) 
//     : null;

//   const dates = displayBars.map((b) => b.date);
//   const confluence = computeConfluence(daily, weekly || daily);

//   return (
//     <div className="space-y-10">

//       {/* VIEW MODE TOGGLE */}
//       <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
//         <div>
//           <h3 className="font-semibold text-blue-900 flex items-center gap-2">
//             <span className="text-2xl">🚀</span>
//             Try Professional Mode
//           </h3>
//           <p className="text-sm text-blue-700 mt-1">
//             Advanced indicators: Ichimoku Cloud, ADX, EMA Ribbons, Order Flow Analysis & more
//           </p>
//         </div>
        
//         {hasEnoughDataForPro ? (
//           <button
//             onClick={() => setViewMode('pro')}
//             className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
//           >
//             Switch to Pro Mode →
//           </button>
//         ) : (
//           <div className="text-sm text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg">
//             Need more data for Pro Mode<br/>
//             <span className="text-xs">(100+ daily, 60+ weekly, 60+ monthly bars)</span>
//           </div>
//         )}
//       </div>

//       {/* EXPLAINER */}
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
//         <h3 className="font-semibold text-blue-900 mb-2">
//           How to read this signal
//         </h3>
//         <ul className="list-disc ml-5 text-sm text-blue-800 space-y-1">
//           <li><strong>Currently viewing:</strong> {timeframeName} chart with {displayBars.length} bars</li>
//           <li>Switch timeframes using the dropdown above to see different perspectives</li>
//           <li>Weekly trend acts as a higher-timeframe filter</li>
//           <li>Final score blends Daily (60%) and Weekly (40%)</li>
//           <li>Aligned scores indicate strong multi-timeframe agreement</li>
//         </ul>
//       </div>

//       {/* PRICE CHART */}
//       <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-4">
//         <h3 className="text-lg font-semibold text-gray-900 mb-3">
//           {symbol} Price Chart - {timeframeName} View ({displayBars.length} bars)
//         </h3>
        
//         <Plot
//           data={[
//             {
//               x: displayBars.map((b) => b.date),
//               open: displayBars.map((b) => b.open),
//               high: displayBars.map((b) => b.high),
//               low: displayBars.map((b) => b.low),
//               close: displayBars.map((b) => b.close),
//               type: "candlestick" as const,
//               name: "Price",
//             },
//             ...(fib
//               ? [
//                   fibLine("Pivot Point", fib.pp, dates),
//                   fibLine("R1", fib.r1, dates),
//                   fibLine("S1", fib.s1, dates),
//                   fibLine("R2", fib.r2, dates),
//                   fibLine("S2", fib.s2, dates),
//                 ]
//               : []),
//             {
//               x: displayBars.map((b) => b.date),
//               y: displaySma50,
//               type: "scatter" as const,
//               mode: "lines" as const,
//               name: "SMA 50",
//               line: { color: "#2563eb", width: 1 },
//             },
//             {
//               x: displayBars.map((b) => b.date),
//               y: displaySma200,
//               type: "scatter" as const,
//               mode: "lines" as const,
//               name: "SMA 200",
//               line: { color: "#7c3aed", width: 1 },
//             },
//             {
//               x: displayBars.map((b) => b.date),
//               y: displayRsi14,
//               yaxis: "y2" as const,
//               type: "scatter" as const,
//               mode: "lines" as const,
//               name: "RSI (14)",
//               line: { color: "#f59e0b", width: 1 },
//             },
//           ]}
//           layout={{
//             height: 550,
//             yaxis2: {
//               overlaying: "y",
//               side: "right",
//               range: [0, 100],
//               title: { text: "RSI" },
//             },
//           }}
//           style={{ width: "100%" }}
//         />
//       </div>

//       {/* CONFIDENCE CARDS */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-900 mb-3">
//           Signal Confidence Overview
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <ConfidenceGauge
//             title={`${timeframeName} Signal Confidence`}
//             subtitle="Currently selected timeframe"
//             score={displayConfidence.score}
//             bias={displayConfidence.bias}
//           />

//           {weekly && (
//             <ConfidenceGauge
//               title="Weekly Trend Confirmation"
//               subtitle="Higher timeframe filter"
//               score={weekly.score}
//               bias={weekly.bias}
//             />
//           )}

//           {!weekly && (weeklyBars.length > 0 || monthlyBars.length > 0) && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-center">
//               <p className="text-sm text-yellow-800 text-center">
//                 Weekly data insufficient<br/>
//                 <span className="text-xs">Need 60+ weeks of data</span>
//               </p>
//             </div>
//           )}

//           <ConfidenceGauge
//             title="Final Confluence Score"
//             subtitle="Daily (60%) + Weekly (40%)"
//             score={confluence.score}
//             bias={confluence.bias}
//           />
//         </div>
//       </div>

//       {/* WHY THIS SIGNAL */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//           Why this signal exists ({timeframeName})
//         </h3>
//         <p className="text-sm text-gray-600 mb-3">
//           Each score is derived from independent technical factors to reduce bias
//           and overfitting.
//         </p>

//         <ConfidenceBreakdown
//           breakdown={{
//             trend: displayConfidence.breakdown.trend,
//             momentum: displayConfidence.breakdown.momentum,
//           }}
//           reasons={displayConfidence.reasons}
//         />
//       </div>

//       {/* TECHNICAL SNAPSHOT & NEWS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <TechnicalSnapshot
//           symbol={symbol}
//           close={displayBars[displayBars.length - 1].close}
//           sma50={displaySma50.at(-1)}
//           sma200={displaySma200.at(-1)}
//           rsi={displayRsi14.at(-1)}
//         />
//         <StockNews symbol={symbol} />
//       </div>

//       {/* MULTI-TIMEFRAME SUMMARY */}
//       {(weekly || monthly) && (
//         <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             📊 Multi-Timeframe Analysis
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-200">
//               <div className="text-sm text-gray-500 mb-1">📅 Daily</div>
//               <div className="text-2xl font-bold text-blue-600">{daily.score}</div>
//               <div className="text-sm text-gray-600">{daily.bias}</div>
//             </div>
//             {weekly && (
//               <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-200">
//                 <div className="text-sm text-gray-500 mb-1">📊 Weekly</div>
//                 <div className="text-2xl font-bold text-purple-600">{weekly.score}</div>
//                 <div className="text-sm text-gray-600">{weekly.bias}</div>
//               </div>
//             )}
//             {monthly && (
//               <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
//                 <div className="text-sm text-gray-500 mb-1">📈 Monthly</div>
//                 <div className="text-2xl font-bold text-green-600">{monthly.score}</div>
//                 <div className="text-sm text-gray-600">{monthly.bias}</div>
//               </div>
//             )}
//           </div>
          
//           <div className="mt-4 p-4 bg-white rounded-lg">
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium text-gray-700">Timeframe Alignment:</span>
//               {weekly && Math.abs(daily.score - weekly.score) < 15 ? (
//                 <span className="text-sm font-semibold text-green-600">✓ Strong Agreement</span>
//               ) : weekly && Math.abs(daily.score - weekly.score) < 30 ? (
//                 <span className="text-sm font-semibold text-yellow-600">⚠ Moderate Divergence</span>
//               ) : weekly ? (
//                 <span className="text-sm font-semibold text-red-600">✗ Strong Divergence</span>
//               ) : (
//                 <span className="text-sm font-semibold text-gray-600">— Insufficient Data</span>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }