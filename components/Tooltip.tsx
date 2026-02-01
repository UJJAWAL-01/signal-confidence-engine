import { useState, useRef, useEffect, useLayoutEffect } from "react"

export default function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  const [open, setOpen] = useState(false)
  const [offset, setOffset] = useState(0)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // useLayoutEffect runs before the paint to prevent "flickering"
  useLayoutEffect(() => {
    if (open && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const screenWidth = window.innerWidth
      const margin = 16 // Gap from screen edge

      let nudge = 0
      
      // 1. Check if leaking off the right side
      if (tooltipRect.right > screenWidth - margin) {
        nudge = screenWidth - tooltipRect.right - margin
      }
      
      // 2. Check if leaking off the left side
      if (tooltipRect.left < margin) {
        nudge = margin - tooltipRect.left
      }

      setOffset(nudge)
    } else {
      setOffset(0)
    }
  }, [open])

  return (
    <div
      ref={triggerRef}
      className="relative group inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      {children}

      {open && (
        <div
          ref={tooltipRef}
          style={{ 
            // This applies the dynamic nudge to the horizontal centering
            transform: `translateX(calc(-50% + ${offset}px))` 
          }}
          className="absolute bottom-full mb-2 left-1/2 z-50 
                     w-max min-w-[180px] max-w-[85vw] sm:max-w-[280px]"
        >
          <div
            className="
              px-3 py-2
              bg-slate-800 text-slate-100
              text-[11px] leading-relaxed
              rounded-md shadow-xl
              text-center
              whitespace-normal break-words
            "
          >
            {content}
          </div>

          {/* Arrow - We also nudge the arrow back so it stays pointing at the icon */}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{ transform: `translateX(calc(-50% - ${offset}px))` }}
          >
            <div className="border-4 border-transparent border-t-slate-800" />
          </div>
        </div>
      )}
    </div>
  )
}