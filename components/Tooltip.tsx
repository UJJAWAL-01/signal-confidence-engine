export default function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  return (
    <div className="relative group inline-flex">
      {children}

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div
          className="
            px-3 py-2
            bg-slate-800 text-slate-100
            text-[11px] leading-relaxed
            rounded-md shadow-xl
            max-w-[240px] w-max
            text-left
            whitespace-normal break-words
          "
        >
          {content}
        </div>

        {/* Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full">
          <div className="border-4 border-transparent border-t-slate-800" />
        </div>
      </div>
    </div>
  )
}
