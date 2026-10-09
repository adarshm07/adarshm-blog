'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  CANVAS,
  RELATION_INFO,
  boxSize,
  edgePoints,
  relationStyle,
  sectionLayout,
  stereotype,
  type ClassKind,
  type Diagram,
  type DiagramClass,
  type RelationType,
} from '@/app/lib/class-diagram'

const KINDS: ClassKind[] = ['class', 'abstract', 'interface', 'enum']
const RELATIONS = Object.keys(RELATION_INFO) as RelationType[]

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`

const inputClass =
  'w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 font-mono text-xs text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:border-green-600 dark:focus:border-green-500 focus:outline-none'
const buttonClass =
  'rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-40 transition-colors'

export function ClassDiagramEditor({
  diagram,
  onChange,
}: {
  diagram: Diagram
  onChange: (next: Diagram) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [rel, setRel] = useState<{ from: string; to: string; type: RelationType; label: string }>({
    from: '',
    to: '',
    type: 'association',
    label: '',
  })
  const localSvg = useRef<SVGSVGElement | null>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const selectedClass = diagram.classes.find((c) => c.id === selected) ?? null

  function toSvgPoint(e: ReactPointerEvent) {
    const svg = localSvg.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return { x: 0, y: 0 }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function updateClass(id: string, patch: Partial<DiagramClass>) {
    onChange({ ...diagram, classes: diagram.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  }

  function addClass() {
    const n = diagram.classes.length
    const cls: DiagramClass = {
      id: newId('c'),
      name: `Class${n + 1}`,
      kind: 'class',
      fields: [],
      methods: [],
      x: 24 + (n % 4) * 190,
      y: 24 + Math.floor(n / 4) * 170,
    }
    onChange({ ...diagram, classes: [...diagram.classes, cls] })
    setSelected(cls.id)
  }

  function deleteSelected() {
    if (!selected) return
    onChange({
      classes: diagram.classes.filter((c) => c.id !== selected),
      relations: diagram.relations.filter((r) => r.from !== selected && r.to !== selected),
    })
    setSelected(null)
  }

  function addRelation() {
    if (!rel.from || !rel.to || rel.from === rel.to) return
    onChange({
      ...diagram,
      relations: [
        ...diagram.relations,
        { id: newId('r'), from: rel.from, to: rel.to, type: rel.type, label: rel.label.trim() || undefined },
      ],
    })
    setRel((r) => ({ ...r, label: '' }))
  }

  function onBoxPointerDown(e: ReactPointerEvent<SVGGElement>, c: DiagramClass) {
    e.stopPropagation()
    setSelected(c.id)
    const p = toSvgPoint(e)
    drag.current = { id: c.id, dx: p.x - c.x, dy: p.y - c.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onBoxPointerMove(e: ReactPointerEvent<SVGGElement>, c: DiagramClass) {
    if (!drag.current || drag.current.id !== c.id) return
    const p = toSvgPoint(e)
    const { width, height } = boxSize(c)
    const x = Math.round(Math.min(Math.max(p.x - drag.current.dx, 0), CANVAS.width - width))
    const y = Math.round(Math.min(Math.max(p.y - drag.current.dy, 0), CANVAS.height - height))
    if (x !== c.x || y !== c.y) updateClass(c.id, { x, y })
  }

  function onBoxPointerUp(e: ReactPointerEvent<SVGGElement>) {
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const byId = new Map(diagram.classes.map((c) => [c.id, c]))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={addClass} className={buttonClass}>
          + Add class
        </button>
        <button type="button" onClick={deleteSelected} disabled={!selected} className={buttonClass}>
          Delete selected
        </button>
        <span className="ml-auto font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
          drag boxes to arrange · tap one to edit
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
        <svg
          ref={localSvg}
          viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
          className="block w-full bg-neutral-50 dark:bg-neutral-950 select-none"
          role="img"
          aria-label="Class diagram"
          onPointerDown={() => setSelected(null)}
        >
          <defs>
            <marker id="cd-tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
              <path d="M1,1 L11,6 L1,11 z" className="fill-neutral-50 dark:fill-neutral-950 stroke-neutral-500" />
            </marker>
            <marker id="cd-arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M1,1 L11,6 L1,11" fill="none" strokeWidth={1.5} className="stroke-neutral-500" />
            </marker>
            <marker id="cd-dfill" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" orient="auto-start-reverse">
              <path d="M1,5 L8,1 L15,5 L8,9 z" className="fill-neutral-500" />
            </marker>
            <marker id="cd-dhollow" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" orient="auto-start-reverse">
              <path d="M1,5 L8,1 L15,5 L8,9 z" className="fill-neutral-50 dark:fill-neutral-950 stroke-neutral-500" />
            </marker>
          </defs>

          {diagram.classes.length === 0 ? (
            <text
              x={CANVAS.width / 2}
              y={CANVAS.height / 2}
              textAnchor="middle"
              className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[14px]"
            >
              Press “+ Add class” to start your diagram
            </text>
          ) : null}

          {diagram.relations.map((r) => {
            const from = byId.get(r.from)
            const to = byId.get(r.to)
            if (!from || !to) return null
            const { start, end } = edgePoints(from, to)
            const style = relationStyle(r.type)
            return (
              <g key={r.id}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  strokeWidth={1.4}
                  strokeDasharray={style.dashed ? '5 4' : undefined}
                  markerStart={style.markerStart ? `url(#cd-${style.markerStart})` : undefined}
                  markerEnd={style.markerEnd ? `url(#cd-${style.markerEnd})` : undefined}
                  className="stroke-neutral-400 dark:stroke-neutral-500"
                />
                {r.label ? (
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 4}
                    textAnchor="middle"
                    className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[10px]"
                  >
                    {r.label}
                  </text>
                ) : null}
              </g>
            )
          })}

          {diagram.classes.map((c) => {
            const L = sectionLayout(c)
            const st = stereotype(c.kind)
            const isSelected = c.id === selected
            return (
              <g
                key={c.id}
                onPointerDown={(e) => onBoxPointerDown(e, c)}
                onPointerMove={(e) => onBoxPointerMove(e, c)}
                onPointerUp={onBoxPointerUp}
                onPointerCancel={onBoxPointerUp}
                style={{ touchAction: 'none', cursor: 'grab' }}
              >
                <rect
                  x={c.x}
                  y={c.y}
                  width={L.width}
                  height={L.height}
                  rx={6}
                  strokeWidth={isSelected ? 2.2 : 1.2}
                  className={[
                    'fill-white dark:fill-neutral-900',
                    isSelected ? 'stroke-amber-500' : 'stroke-green-600 dark:stroke-green-500',
                  ].join(' ')}
                />
                {st ? (
                  <text x={c.x + L.width / 2} y={c.y + 12} textAnchor="middle" className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[9px]">
                    {st}
                  </text>
                ) : null}
                <text
                  x={c.x + L.width / 2}
                  y={c.y + (st ? 26 : 21)}
                  textAnchor="middle"
                  fontStyle={c.kind === 'abstract' ? 'italic' : undefined}
                  className="fill-neutral-900 dark:fill-neutral-50 font-mono text-[12px] font-semibold"
                >
                  {c.name || '(unnamed)'}
                </text>
                <line x1={c.x} y1={c.y + L.fieldsTop} x2={c.x + L.width} y2={c.y + L.fieldsTop} className="stroke-neutral-300 dark:stroke-neutral-700" />
                <line x1={c.x} y1={c.y + L.methodsTop} x2={c.x + L.width} y2={c.y + L.methodsTop} className="stroke-neutral-300 dark:stroke-neutral-700" />
                {c.fields.map((f, i) => (
                  <text key={`f${i}`} x={c.x + L.padX} y={c.y + L.fieldsTop + 14 + i * L.lineH} className="fill-neutral-700 dark:fill-neutral-200 font-mono text-[11px]">
                    {f}
                  </text>
                ))}
                {c.methods.map((m, i) => (
                  <text key={`m${i}`} x={c.x + L.padX} y={c.y + L.methodsTop + 14 + i * L.lineH} className="fill-neutral-700 dark:fill-neutral-200 font-mono text-[11px]">
                    {m}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      {selectedClass ? (
        <div className="grid gap-2 rounded-xl border border-amber-500/40 p-3 sm:grid-cols-2">
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Name
            <input
              value={selectedClass.name}
              onChange={(e) => updateClass(selectedClass.id, { name: e.target.value.replace(/\s+/g, '') })}
              className={inputClass}
            />
          </label>
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Kind
            <select
              value={selectedClass.kind}
              onChange={(e) => updateClass(selectedClass.id, { kind: e.target.value as ClassKind })}
              className={inputClass}
            >
              {KINDS.map((k) => (
                <option key={k} value={k} className="bg-white dark:bg-neutral-900">
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Fields — one per line
            <textarea
              rows={4}
              value={selectedClass.fields.join('\n')}
              onChange={(e) => updateClass(selectedClass.id, { fields: e.target.value.split('\n') })}
              onBlur={(e) => updateClass(selectedClass.id, { fields: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
              placeholder={'- spots: Spot[]\n- capacity: int'}
              className={inputClass}
            />
          </label>
          <label className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Methods — one per line
            <textarea
              rows={4}
              value={selectedClass.methods.join('\n')}
              onChange={(e) => updateClass(selectedClass.id, { methods: e.target.value.split('\n') })}
              onBlur={(e) => updateClass(selectedClass.id, { methods: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
              placeholder={'+ park(v: Vehicle): Ticket\n+ leave(t: Ticket): Fee'}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-3">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Relationships
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select value={rel.from} onChange={(e) => setRel({ ...rel, from: e.target.value })} className={inputClass} aria-label="From class">
            <option value="">from…</option>
            {diagram.classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-neutral-900">
                {c.name}
              </option>
            ))}
          </select>
          <select value={rel.type} onChange={(e) => setRel({ ...rel, type: e.target.value as RelationType })} className={inputClass} aria-label="Relationship type">
            {RELATIONS.map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-neutral-900">
                {RELATION_INFO[t].label}
              </option>
            ))}
          </select>
          <select value={rel.to} onChange={(e) => setRel({ ...rel, to: e.target.value })} className={inputClass} aria-label="To class">
            <option value="">to…</option>
            {diagram.classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-neutral-900">
                {c.name}
              </option>
            ))}
          </select>
          <input value={rel.label} onChange={(e) => setRel({ ...rel, label: e.target.value })} placeholder="label (1..*)" className={inputClass} />
        </div>
        <button
          type="button"
          onClick={addRelation}
          disabled={!rel.from || !rel.to || rel.from === rel.to}
          className={`mt-2 ${buttonClass}`}
        >
          Add relationship
        </button>

        {diagram.relations.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {diagram.relations.map((r) => {
              const from = byId.get(r.from)
              const to = byId.get(r.to)
              if (!from || !to) return null
              return (
                <li key={r.id} className="flex items-center justify-between gap-2 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  <span className="min-w-0 truncate">
                    {from.name} {RELATION_INFO[r.type].verb.split(' (')[0]} {to.name}
                    {r.label ? ` [${r.label}]` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange({ ...diagram, relations: diagram.relations.filter((x) => x.id !== r.id) })}
                    className="shrink-0 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400"
                    aria-label="Remove relationship"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
        <p className="mt-2 text-[10px] leading-relaxed text-neutral-400 dark:text-neutral-500">
          Composition and aggregation are drawn with the diamond at the <em>from</em> (owner) end; the other arrows point
          at the <em>to</em> class.
        </p>
      </div>
    </div>
  )
}
