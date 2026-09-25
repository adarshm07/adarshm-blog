'use client'

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

export type NodeKind =
  | 'client'
  | 'gateway'
  | 'service'
  | 'database'
  | 'cache'
  | 'queue'
  | 'storage'
  | 'external'

export type BoardNode = {
  id: string
  kind: NodeKind
  label: string
  x: number
  y: number
}

export type BoardEdge = {
  id: string
  from: string
  to: string
  label: string
}

export type Board = { nodes: BoardNode[]; edges: BoardEdge[] }

export const EMPTY_BOARD: Board = { nodes: [], edges: [] }

const W = 900
const H = 520
const NODE_W = 132
const NODE_H = 48

const KINDS: { kind: NodeKind; label: string; fill: string; stroke: string }[] = [
  { kind: 'client', label: 'Client', fill: 'fill-neutral-200 dark:fill-neutral-700', stroke: 'stroke-neutral-400' },
  { kind: 'gateway', label: 'Gateway / LB', fill: 'fill-sky-100 dark:fill-sky-950', stroke: 'stroke-sky-400' },
  { kind: 'service', label: 'Service', fill: 'fill-green-100 dark:fill-green-950', stroke: 'stroke-green-500' },
  { kind: 'database', label: 'Database', fill: 'fill-amber-100 dark:fill-amber-950', stroke: 'stroke-amber-500' },
  { kind: 'cache', label: 'Cache', fill: 'fill-rose-100 dark:fill-rose-950', stroke: 'stroke-rose-400' },
  { kind: 'queue', label: 'Queue / Log', fill: 'fill-violet-100 dark:fill-violet-950', stroke: 'stroke-violet-400' },
  { kind: 'storage', label: 'Blob store', fill: 'fill-teal-100 dark:fill-teal-950', stroke: 'stroke-teal-400' },
  { kind: 'external', label: 'Third party', fill: 'fill-neutral-100 dark:fill-neutral-800', stroke: 'stroke-neutral-400' },
]

const KIND_STYLE = new Map(KINDS.map((k) => [k.kind, k]))

const uid = () => Math.random().toString(36).slice(2, 9)

/** Anchor an edge on the box edges rather than the centres, so arrows meet the border. */
function anchor(from: BoardNode, to: BoardNode) {
  const fx = from.x + NODE_W / 2
  const fy = from.y + NODE_H / 2
  const tx = to.x + NODE_W / 2
  const ty = to.y + NODE_H / 2
  const dx = tx - fx
  const dy = ty - fy
  const clip = (cx: number, cy: number, sx: number, sy: number) => {
    const scaleX = Math.abs(dx) > 0.001 ? NODE_W / 2 / Math.abs(dx) : Infinity
    const scaleY = Math.abs(dy) > 0.001 ? NODE_H / 2 / Math.abs(dy) : Infinity
    const t = Math.min(scaleX, scaleY)
    return { x: cx + dx * t * sx, y: cy + dy * t * sy }
  }
  return { start: clip(fx, fy, 1, 1), end: clip(tx, ty, -1, -1) }
}

/** A text form of the diagram, so the grader reads the architecture and not an image. */
export function describeBoard(board: Board): string {
  if (board.nodes.length === 0) return ''
  const byId = new Map(board.nodes.map((n) => [n.id, n]))
  const components = board.nodes
    .map((n) => `- ${n.label} (${n.kind})`)
    .join('\n')
  const connections = board.edges
    .map((e) => {
      const from = byId.get(e.from)
      const to = byId.get(e.to)
      if (!from || !to) return null
      return `- ${from.label} → ${to.label}${e.label ? ` [${e.label}]` : ''}`
    })
    .filter(Boolean)
    .join('\n')

  return `Components:\n${components}\n\nConnections:\n${
    connections || '- (none drawn)'
  }`
}

export function DesignBoard({
  board,
  onChange,
}: {
  board: Board
  /** A state setter, so drag updates can be functional and never read a stale board. */
  onChange: Dispatch<SetStateAction<Board>>
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const selectedNode = board.nodes.find((n) => n.id === selected) ?? null

  const toBoardCoords = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    }
  }, [])

  function addNode(kind: NodeKind) {
    const count = board.nodes.length
    const node: BoardNode = {
      id: uid(),
      kind,
      label: KIND_STYLE.get(kind)!.label,
      // lay new boxes out in a loose grid so they never land on top of each other
      x: 40 + (count % 5) * (NODE_W + 24),
      y: 40 + Math.floor(count / 5) * (NODE_H + 48),
    }
    onChange({ ...board, nodes: [...board.nodes, node] })
    setSelected(node.id)
  }

  function onNodePointerDown(e: React.PointerEvent, node: BoardNode) {
    e.stopPropagation()

    if (connectFrom) {
      if (connectFrom !== node.id) {
        const exists = board.edges.some((x) => x.from === connectFrom && x.to === node.id)
        if (!exists) {
          onChange({
            ...board,
            edges: [...board.edges, { id: uid(), from: connectFrom, to: node.id, label: '' }],
          })
        }
      }
      setConnectFrom(null)
      return
    }

    setSelected(node.id)
    const point = toBoardCoords(e.clientX, e.clientY)
    dragRef.current = { id: node.id, dx: point.x - node.x, dy: point.y - node.y }

    // Listen on the window rather than the SVG: pointer capture retargets
    // events in ways that differ between mouse and touch, and dragging past
    // the board edge should still track.
    const move = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      event.preventDefault()
      const at = toBoardCoords(event.clientX, event.clientY)
      onChange((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === drag.id
            ? {
                ...n,
                x: Math.min(Math.max(at.x - drag.dx, 0), W - NODE_W),
                y: Math.min(Math.max(at.y - drag.dy, 0), H - NODE_H),
              }
            : n
        ),
      }))
    }
    // Chrome ignores touch-action on SVG child elements, so a touch drag is
    // otherwise claimed as a pan and the pointer is cancelled after one move.
    const blockScroll = (event: TouchEvent) => event.preventDefault()

    const up = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('touchmove', blockScroll)
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('touchmove', blockScroll, { passive: false })
  }

  function remove(id: string) {
    onChange({
      nodes: board.nodes.filter((n) => n.id !== id),
      edges: board.edges.filter((e) => e.from !== id && e.to !== id),
    })
    setSelected(null)
  }

  function rename(id: string, label: string) {
    onChange({ ...board, nodes: board.nodes.map((n) => (n.id === id ? { ...n, label } : n)) })
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        e.preventDefault()
        remove(selected)
      }
      if (e.key === 'Escape') {
        setConnectFrom(null)
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, board])

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => addNode(k.kind)}
            className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:border-green-600 dark:hover:border-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
          >
            + {k.label}
          </button>
        ))}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setConnectFrom(connectFrom ? null : (selected ?? null))}
          disabled={!selected && !connectFrom}
          className={[
            'rounded-md px-2 py-1 text-[11px] transition-colors disabled:opacity-40',
            connectFrom
              ? 'bg-amber-500 text-white'
              : 'border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-green-600 dark:hover:border-green-500',
          ].join(' ')}
        >
          {connectFrom ? 'Click the target box…' : 'Connect from selected'}
        </button>

        {selectedNode && (
          <>
            <input
              value={selectedNode.label}
              onChange={(e) => rename(selectedNode.id, e.target.value)}
              aria-label="Rename selected box"
              className="w-44 rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-[11px] text-neutral-800 dark:text-neutral-100 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => remove(selectedNode.id)}
              className="rounded-md px-2 py-1 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Delete
            </button>
          </>
        )}

        {board.nodes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear the whole board?')) onChange(EMPTY_BOARD)
            }}
            className="ml-auto rounded-md px-2 py-1 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            Clear board
          </button>
        )}
      </div>

      <div className="touch-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        onPointerDown={() => {
          setSelected(null)
          setConnectFrom(null)
        }}
        role="application"
        aria-label="System design board"
      >
        <defs>
          <marker
            id="board-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-neutral-400 dark:fill-neutral-500" />
          </marker>
          <pattern id="board-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="fill-neutral-200 dark:fill-neutral-800" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="url(#board-grid)" />

        {board.edges.map((edge) => {
          const from = board.nodes.find((n) => n.id === edge.from)
          const to = board.nodes.find((n) => n.id === edge.to)
          if (!from || !to) return null
          const { start, end } = anchor(from, to)
          return (
            <line
              key={edge.id}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              className="stroke-neutral-400 dark:stroke-neutral-500"
              strokeWidth={1.5}
              markerEnd="url(#board-arrow)"
            />
          )
        })}

        {board.nodes.map((node) => {
          const style = KIND_STYLE.get(node.kind)!
          const isSelected = selected === node.id
          const isSource = connectFrom === node.id
          return (
            <g
              key={node.id}
              onPointerDown={(e) => onNodePointerDown(e, node)}
              className="cursor-move"
            >
              <rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx={8}
                className={[
                  style.fill,
                  isSelected || isSource ? 'stroke-green-600 dark:stroke-green-500' : style.stroke,
                ].join(' ')}
                strokeWidth={isSelected || isSource ? 2 : 1.25}
              />
              <text
                x={node.x + NODE_W / 2}
                y={node.y + NODE_H / 2 + 4}
                textAnchor="middle"
                className="pointer-events-none fill-neutral-800 dark:fill-neutral-100 font-mono text-[11px]"
              >
                {node.label.length > 18 ? `${node.label.slice(0, 17)}…` : node.label}
              </text>
            </g>
          )
        })}

        {board.nodes.length === 0 && (
          <text
            x={W / 2}
            y={H / 2}
            textAnchor="middle"
            className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[13px]"
          >
            Add a box above to start drawing
          </text>
        )}
      </svg>
      </div>

      <p className="mt-1.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
        drag to move · select a box then &quot;connect&quot; to draw an arrow · delete or
        backspace removes the selection
      </p>
    </div>
  )
}
