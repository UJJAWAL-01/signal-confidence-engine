export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Signal Intelligence
        </h1>
        <p className="text-xs text-slate-400">Institutional Analysis</p>
      </div>
    </div>
  );
}