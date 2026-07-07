'use client'

import { useEffect, useRef, useState } from 'react'

type Tool = 'pen' | 'eraser' | 'text'

const PEN_COLORS = ['#111827', '#ef4444', '#16a34a', '#2563eb', '#eab308']
const BG_PRESETS = ['#ffffff', '#fef3c7', '#dcfce7', '#dbeafe', '#111827']

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function NotesCanvas({ slug }: { slug: string }) {
  const drawKey = `adarshm-notes-draw:${slug}`
  const bgKey = `adarshm-notes-bg:${slug}`

  const [open, setOpen] = useState(false)
  const [tool, setTool] = useState<Tool>('pen')
  const [penColor, setPenColor] = useState(PEN_COLORS[0])
  const [penSize, setPenSize] = useState(3)
  const [bgColor, setBgColor] = useState(BG_PRESETS[0])
  const [bgOpacity, setBgOpacity] = useState(0.9)
  const [copied, setCopied] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawing = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  // Restore saved background settings once, and note whether a drawing exists.
  useEffect(() => {
    try {
      const bg = localStorage.getItem(bgKey)
      if (bg) {
        const parsed = JSON.parse(bg)
        if (parsed.color) setBgColor(parsed.color)
        if (typeof parsed.opacity === 'number') setBgOpacity(parsed.opacity)
      }
      setHasSaved(!!localStorage.getItem(drawKey))
    } catch {
      /* localStorage unavailable — feature just runs without persistence */
    }
    loaded.current = true
  }, [bgKey, drawKey])

  // Persist background settings when they change (after the initial load).
  useEffect(() => {
    if (!loaded.current) return
    try {
      localStorage.setItem(bgKey, JSON.stringify({ color: bgColor, opacity: bgOpacity }))
    } catch {
      /* ignore quota errors */
    }
  }, [bgColor, bgOpacity, bgKey])

  // Size the canvas to the viewport, restore any saved drawing, lock scroll.
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctxRef.current = ctx

    try {
      const saved = localStorage.getItem(drawKey)
      if (saved) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, w, h)
        img.src = saved
      }
    } catch {
      /* ignore */
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => {
      window.removeEventListener('keydown', onEsc)
      document.body.style.overflow = prevOverflow
    }
  }, [open, drawKey])

  function persistDrawing() {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      localStorage.setItem(drawKey, canvas.toDataURL('image/png'))
      setHasSaved(true)
    } catch {
      /* ignore quota errors */
    }
  }

  function pointerPos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startStroke(e: React.PointerEvent) {
    const ctx = ctxRef.current
    if (!ctx) return
    const { x, y } = pointerPos(e)

    if (tool === 'text') {
      placeTextInput(x, y)
      return
    }

    drawing.current = true
    ctx.globalCompositeOperation =
      tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = penColor
    ctx.lineWidth = tool === 'eraser' ? penSize * 6 : penSize
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function moveStroke(e: React.PointerEvent) {
    if (!drawing.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    const { x, y } = pointerPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endStroke() {
    if (!drawing.current) return
    drawing.current = false
    persistDrawing()
  }

  function placeTextInput(x: number, y: number) {
    const overlay = overlayRef.current
    if (!overlay) return
    const input = document.createElement('input')
    input.type = 'text'
    input.style.position = 'absolute'
    input.style.left = `${x}px`
    input.style.top = `${y - 12}px`
    input.style.font = `${penSize * 6 + 10}px sans-serif`
    input.style.color = penColor
    input.style.background = 'transparent'
    input.style.border = `1px dashed ${penColor}`
    input.style.outline = 'none'
    input.style.padding = '0 2px'
    input.style.zIndex = '10'
    overlay.appendChild(input)
    input.focus()

    const commit = () => {
      const value = input.value.trim()
      if (value && ctxRef.current) {
        const ctx = ctxRef.current
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = penColor
        ctx.font = `${penSize * 6 + 10}px sans-serif`
        ctx.textBaseline = 'top'
        ctx.fillText(value, x + 2, y - 12)
        persistDrawing()
      }
      input.remove()
    }
    input.addEventListener('blur', commit)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur()
      if (e.key === 'Escape') {
        input.value = ''
        input.blur()
      }
    })
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    try {
      localStorage.removeItem(drawKey)
    } catch {
      /* ignore */
    }
    setHasSaved(false)
  }

  function composite(): HTMLCanvasElement | null {
    const src = canvasRef.current
    if (!src) return null
    const out = document.createElement('canvas')
    out.width = src.width
    out.height = src.height
    const ctx = out.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = hexToRgba(bgColor, bgOpacity)
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.drawImage(src, 0, 0)
    return out
  }

  function downloadPng() {
    const out = composite()
    if (!out) return
    const link = document.createElement('a')
    link.download = `notes-${slug}-${Date.now()}.png`
    link.href = out.toDataURL('image/png')
    link.click()
  }

  async function copyToClipboard() {
    const out = composite()
    if (!out) return
    out.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {
        downloadPng()
      }
    }, 'image/png')
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open notes canvas"
        className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-2.5 py-3 text-neutral-600 dark:text-neutral-300 shadow-sm hover:text-green-700 dark:hover:text-green-400 hover:border-green-400 transition-colors"
      >
        <span aria-hidden className="text-base">✎</span>
        <span className="text-[10px] font-medium [writing-mode:vertical-rl]">
          Notes
        </span>
        {hasSaved && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500"
            title="Saved notes on this post"
          />
        )}
      </button>
    )
  }

  const btn =
    'shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors border'
  const active = 'bg-green-600 dark:bg-green-500 text-white border-transparent'
  const idle =
    'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-green-400'

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{ background: hexToRgba(bgColor, bgOpacity) }}
      />
      <canvas
        ref={canvasRef}
        onPointerDown={startStroke}
        onPointerMove={moveStroke}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        className="absolute inset-0 touch-none"
        style={{ cursor: tool === 'text' ? 'text' : 'crosshair' }}
      />

      <div className="absolute left-1/2 top-3 -translate-x-1/2 z-20 flex w-[min(96vw,880px)] items-center gap-2 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-3 py-2 shadow-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* tools */}
        <div className="flex shrink-0 gap-1">
          <button type="button" className={`${btn} ${tool === 'pen' ? active : idle}`} onClick={() => setTool('pen')}>
            ✎ Pen
          </button>
          <button type="button" className={`${btn} ${tool === 'text' ? active : idle}`} onClick={() => setTool('text')}>
            T Text
          </button>
          <button type="button" className={`${btn} ${tool === 'eraser' ? active : idle}`} onClick={() => setTool('eraser')}>
            ⌫ Eraser
          </button>
        </div>

        <span className="h-5 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700" />

        {/* pen colors */}
        <div className="flex shrink-0 items-center gap-1">
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Pen color ${c}`}
              onClick={() => setPenColor(c)}
              className={`h-5 w-5 rounded-full border-2 ${penColor === c ? 'border-green-500' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>

        {/* pen size */}
        <label className="flex shrink-0 items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Size
          <input
            type="range"
            min={1}
            max={10}
            value={penSize}
            onChange={(e) => setPenSize(Number(e.target.value))}
            className="w-14 accent-green-600"
          />
        </label>

        <span className="h-5 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700" />

        {/* background */}
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">BG</span>
          {BG_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Background ${c}`}
              onClick={() => setBgColor(c)}
              className={`h-5 w-5 rounded border ${bgColor === c ? 'border-green-500' : 'border-neutral-300 dark:border-neutral-600'}`}
              style={{ background: c }}
            />
          ))}
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            aria-label="Custom background color"
            className="h-5 w-5 cursor-pointer rounded border border-neutral-300 dark:border-neutral-600 bg-transparent p-0"
          />
        </div>

        <label className="flex shrink-0 items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Opacity
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(bgOpacity * 100)}
            onChange={(e) => setBgOpacity(Number(e.target.value) / 100)}
            className="w-14 accent-green-600"
          />
        </label>

        <span className="h-5 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700" />

        {/* actions */}
        <button type="button" className={`${btn} ${idle}`} onClick={clearCanvas}>
          Clear
        </button>
        <button type="button" className={`${btn} ${idle}`} onClick={downloadPng}>
          ↓ PNG
        </button>
        <button type="button" className={`${btn} ${idle}`} onClick={copyToClipboard}>
          {copied ? '✓ Copied' : '⧉ Copy'}
        </button>
        <button
          type="button"
          className={`${btn} bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent`}
          onClick={() => setOpen(false)}
        >
          ✕ Close
        </button>
      </div>

      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 text-center text-[11px] text-neutral-500 dark:text-neutral-400">
        Notes auto-save on this post · lower the background opacity to trace the article · Esc to close
      </p>
    </div>
  )
}
