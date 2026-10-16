'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  ARCH_CANVAS,
  NODE_H,
  NODE_KINDS,
  NODE_W,
  archEdgePoints,
  clip,
  nodeCenter,
  nodePath,
  nodeTextY,
  starterArchitecture,
  type ArchDiagram,
  type ArchNode,
  type NodeKind,
} from '@/app/lib/architecture-diagram'

const KINDS = Object.keys(NODE_KINDS) as NodeKind[]

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`

const inputClass =
  'w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 font-mono text-xs text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:border-green-600 dark:focus:border-green-500 focus:outline-none'
const buttonClass =
  'rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-40 transition-colors'

export function ArchitectureDiagramEditor({
  diagram,
  onChange,
}: {
  diagram: ArchDiagram
  onChange: (next: ArchDiagram) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [kindToAdd, setKindToAdd] = useState<NodeKind>('service')
  const [conn, setConn] = useState({ from: '', to: '', label: '', async: false })
  const svgRef = useRef<SVGSVGElement | null>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const selectedNode = diagram.nodes.find((n) => n.id === selected) ?? null
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]))

  function toSvgPoint(e: ReactPointerEvent) {
    const ctm = svgRef.current?.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function updateNode(id: string, patch: Partial<ArchNode>) {
    onChange({ ...diagram, nodes: diagram.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) })
  }

  function addNode() {
    const n = diagram.nodes.length
    const node: ArchNode = {
      id: newId('n'),
      kind: kindToAdd,
      label: NODE_KINDS[kindToAdd].label,
      note: '',
      x: 20 + (n % 5) * 156,
      y: 20 + (Math.floor(n / 5) % 6) * 84,
    }
    onChange({ ...diagram, nodes: [...diagram.nodes, node] })
    setSelected(node.id)
  }

  function deleteSelected() {
    if (!selected) return
    onChange({
      nodes: diagram.nodes.filter((n) => n.id !== selected),
      edges: diagram.edges.filter((e) => e.from !== selected && e.to !== selected),
    })
    setSelected(null)
  }

  function addConnection() {
    if (!conn.from || !conn.to || conn.from === conn.to) return
    onChange({
      ...diagram,
      edges: [...diagram.edges, { id: newId('e'), from: conn.from, to: conn.to, label: conn.label.trim(), async: conn.async }],
    })
    setConn((c) => ({ ...c, label: '' }))
  }

  function onNodePointerDown(e: ReactPointerEvent<SVGGElement>, n: ArchNode) {
    e.stopPropagation()
    setSelected(n.id)
    const p = toSvgPoint(e)
    drag.current = { id: n.id, dx: p.x - n.x, dy: p.y - n.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onNodePointerMove(e: ReactPointerEvent<SVGGElement>, n: ArchNode) {
    if (!drag.current || drag.current.id !== n.id) return
    const p = toSvgPoint(e)
    const x = Math.round(Math.min(Math.max(p.x - drag.current.dx, 0), ARCH_CANVAS.width - NODE_W))
    const y = Math.round(Math.min(Math.max(p.y - drag.current.dy, 0), ARCH_CANVAS.height - NODE_H))
    if (x !== n.x || y !== n.y) updateNode(n.id, { x, y })
  }

  function onNodePointerUp(e: ReactPointerEvent<SVGGElement>) {
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={kindToAdd}
          onChange={(e) => setKindToAdd(e.target.value as NodeKind)}
          aria-label="Component type"
          className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs text-neutral-700 dark:text-neutral-200 focus:outline-none"
        >
          {KINDS.map((k) => (
            <option key={k} value={k} className="bg-white dark:bg-neutral-900">
              {NODE_KINDS[k].label}
            </option>
          ))}
        </select>
        <button type="button" onClick={addNode} className={buttonClass}>
          + Add component
        </button>
        <button type="button" onClick={deleteSelected} disabled={!selected} className={buttonClass}>
          Delete selected
        </button>
        {diagram.nodes.length === 0 ? (
          <button type="button" onClick={() => onChange(starterArchitecture(newId))} className={buttonClass}>
            Start from a typical web app
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${ARCH_CANVAS.width} ${ARCH_CANVAS.height}`}
          className="block w-full min-w-[600px] bg-neutral-50 dark:bg-neutral-950 select-none"
          role="img"
          aria-label="Architecture diagram"
          onPointerDown={() => setSelected(null)}
        >
          <defs>
            <marker id="ad-arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M1,1 L11,6 L1,11" fill="none" strokeWidth={1.5} className="stroke-neutral-500" />
            </marker>
          </defs>

          {diagram.nodes.length === 0 ? (
            <text
              x={ARCH_CANVAS.width / 2}
              y={ARCH_CANVAS.height / 2}
              textAnchor="middle"
              className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[14px]"
            >
              Add components, or start from a typical web app
            </text>
          ) : null}

          {diagram.edges.map((edge) => {
            const from = byId.get(edge.from)
            const to = byId.get(edge.to)
            if (!from || !to) return null
            const { start, end } = archEdgePoints(from, to)
            const mx = (start.x + end.x) / 2
            const my = (start.y + end.y) / 2
            return (
              <g key={edge.id}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  strokeWidth={1.4}
                  strokeDasharray={edge.async ? '6 4' : undefined}
                  markerEnd="url(#ad-arrow)"
                  className="stroke-neutral-400 dark:stroke-neutral-500"
                />
                {edge.label ? (
                  <>
                    <rect
                      x={mx - (edge.label.length * 6.2) / 2 - 3}
                      y={my - 8}
                      width={edge.label.length * 6.2 + 6}
                      height={14}
                      rx={3}
                      className="fill-neutral-50 dark:fill-neutral-950"
                    />
                    <text x={mx} y={my + 3} textAnchor="middle" className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[10px]">
                      {edge.label}
                    </text>
                  </>
                ) : null}
              </g>
            )
          })}

          {diagram.nodes.map((n) => {
            const c = nodeCenter(n)
            const t = nodeTextY(n)
            const isSelected = n.id === selected
            return (
              <g
                key={n.id}
                onPointerDown={(e) => onNodePointerDown(e, n)}
                onPointerMove={(e) => onNodePointerMove(e, n)}
                onPointerUp={onNodePointerUp}
                onPointerCancel={onNodePointerUp}
                style={{ touchAction: 'none', cursor: 'grab' }}
              >
                <path
                  d={nodePath(n)}
                  strokeWidth={isSelected ? 2.2 : 1.2}
                  className={[
                    'fill-white dark:fill-neutral-900',
                    isSelected ? 'stroke-amber-500' : 'stroke-green-600 dark:stroke-green-500',
                  ].join(' ')}
                />
                <text x={c.x} y={t.kind} textAnchor="middle" className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[8px] uppercase">
                  {NODE_KINDS[n.kind].label}
                </text>
                <text x={c.x} y={t.label} textAnchor="middle" className="fill-neutral-900 dark:fill-neutral-50 font-mono text-[12px] font-semibold">
                  {clip(n.label || '(unnamed)', 17)}
                </text>
                {n.note.trim() ? (
                  <text x={c.x} y={t.note} textAnchor="middle" className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[9px]">
                    {clip(n.note.trim(), 20)}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
      <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
        drag components to arrange · tap one to edit · dashed arrows are async
      </p>

      {selectedNode ? (
        <div className="grid gap-2 rounded-xl border border-amber-500/40 p-3 sm:grid-cols-3">
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Label
            <input
              value={selectedNode.label}
              maxLength={40}
              onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Type
            <select
              value={selectedNode.kind}
              onChange={(e) => updateNode(selectedNode.id, { kind: e.target.value as NodeKind })}
              className={inputClass}
            >
              {KINDS.map((k) => (
                <option key={k} value={k} className="bg-white dark:bg-neutral-900">
                  {NODE_KINDS[k].label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Detail
            <input
              value={selectedNode.note}
              maxLength={120}
              onChange={(e) => updateNode(selectedNode.id, { note: e.target.value })}
              placeholder="Postgres, sharded by user_id"
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-3">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Connections
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select value={conn.from} onChange={(e) => setConn({ ...conn, from: e.target.value })} className={inputClass} aria-label="From component">
            <option value="">from…</option>
            {diagram.nodes.map((n) => (
              <option key={n.id} value={n.id} className="bg-white dark:bg-neutral-900">
                {n.label}
              </option>
            ))}
          </select>
          <select value={conn.to} onChange={(e) => setConn({ ...conn, to: e.target.value })} className={inputClass} aria-label="To component">
            <option value="">to…</option>
            {diagram.nodes.map((n) => (
              <option key={n.id} value={n.id} className="bg-white dark:bg-neutral-900">
                {n.label}
              </option>
            ))}
          </select>
          <input
            value={conn.label}
            maxLength={40}
            onChange={(e) => setConn({ ...conn, label: e.target.value })}
            placeholder="label (gRPC, read…)"
            aria-label="Connection label"
            className={inputClass}
          />
          <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
            <input type="checkbox" checked={conn.async} onChange={(e) => setConn({ ...conn, async: e.target.checked })} />
            async
          </label>
        </div>
        <button
          type="button"
          onClick={addConnection}
          disabled={!conn.from || !conn.to || conn.from === conn.to}
          className={`mt-2 ${buttonClass}`}
        >
          Add connection
        </button>

        {diagram.edges.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {diagram.edges.map((edge) => {
              const from = byId.get(edge.from)
              const to = byId.get(edge.to)
              if (!from || !to) return null
              return (
                <li key={edge.id} className="flex items-center justify-between gap-2 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  <span className="min-w-0 truncate">
                    {from.label} → {to.label}
                    {edge.label ? `: ${edge.label}` : ''}
                    {edge.async ? ' (async)' : ''}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ ...diagram, edges: diagram.edges.map((x) => (x.id === edge.id ? { ...x, async: !x.async } : x)) })
                      }
                      className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {edge.async ? 'make sync' : 'make async'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...diagram, edges: diagram.edges.filter((x) => x.id !== edge.id) })}
                      className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400"
                      aria-label="Remove connection"
                    >
                      ✕
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
