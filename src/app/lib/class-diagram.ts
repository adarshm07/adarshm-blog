/**
 * The class-diagram model behind the LLD practice tool, plus everything that
 * is pure: box geometry, edge routing, a text serialisation for Claude, and a
 * standalone SVG for PNG export. The editor component only handles input.
 */

export type ClassKind = 'class' | 'abstract' | 'interface' | 'enum'

export type DiagramClass = {
  id: string
  name: string
  kind: ClassKind
  fields: string[]
  methods: string[]
  x: number
  y: number
}

export type RelationType =
  | 'inheritance'
  | 'implements'
  | 'composition'
  | 'aggregation'
  | 'association'
  | 'dependency'

export type DiagramRelation = {
  id: string
  from: string // class id
  to: string // class id
  type: RelationType
  label?: string
}

export type Diagram = { classes: DiagramClass[]; relations: DiagramRelation[] }

export const EMPTY_DIAGRAM: Diagram = { classes: [], relations: [] }

/** How each relation reads in a sentence, from → to. */
export const RELATION_INFO: Record<RelationType, { label: string; verb: string }> = {
  inheritance: { label: 'Inheritance (is-a)', verb: 'extends' },
  implements: { label: 'Implements', verb: 'implements' },
  composition: { label: 'Composition (owns)', verb: 'owns (composition — parts die with it)' },
  aggregation: { label: 'Aggregation (has)', verb: 'has (aggregation — parts can exist alone)' },
  association: { label: 'Association (uses)', verb: 'is associated with' },
  dependency: { label: 'Dependency', verb: 'depends on' },
}

export const CANVAS = { width: 800, height: 520 }

// Monospace metrics used for sizing boxes, on screen and in the exported SVG.
const CHAR_W = 6.6
const LINE_H = 15
const PAD_X = 8
const HEADER_H = 34

export function boxSize(c: DiagramClass) {
  const lines = [c.name, ...c.fields, ...c.methods]
  const longest = Math.max(10, ...lines.map((l) => l.length))
  const width = Math.min(260, Math.max(120, longest * CHAR_W + PAD_X * 2))
  const sections = (c.fields.length ? c.fields.length : 0.6) + (c.methods.length ? c.methods.length : 0.6)
  const height = HEADER_H + sections * LINE_H + 16
  return { width, height }
}

export function sectionLayout(c: DiagramClass) {
  const { width, height } = boxSize(c)
  const fieldsTop = HEADER_H
  const fieldsH = (c.fields.length || 0.6) * LINE_H + 8
  const methodsTop = fieldsTop + fieldsH
  return { width, height, fieldsTop, methodsTop, lineH: LINE_H, padX: PAD_X }
}

/** Where the line between two box centres crosses the edge of a box. */
function borderPoint(cx: number, cy: number, w: number, h: number, tx: number, ty: number) {
  const dx = tx - cx
  const dy = ty - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const scale = 1 / Math.max(Math.abs(dx) / (w / 2), Math.abs(dy) / (h / 2))
  return { x: cx + dx * scale, y: cy + dy * scale }
}

export function edgePoints(from: DiagramClass, to: DiagramClass) {
  const a = boxSize(from)
  const b = boxSize(to)
  const ac = { x: from.x + a.width / 2, y: from.y + a.height / 2 }
  const bc = { x: to.x + b.width / 2, y: to.y + b.height / 2 }
  return {
    start: borderPoint(ac.x, ac.y, a.width, a.height, bc.x, bc.y),
    end: borderPoint(bc.x, bc.y, b.width, b.height, ac.x, ac.y),
  }
}

const stereotype = (kind: ClassKind) =>
  kind === 'interface' ? '«interface»' : kind === 'abstract' ? '«abstract»' : kind === 'enum' ? '«enum»' : ''

/** Plain-text form of the diagram — what Claude actually reads. */
export function diagramToText(d: Diagram): string {
  if (d.classes.length === 0) return '(no diagram drawn)'
  const byId = new Map(d.classes.map((c) => [c.id, c]))
  const blocks = d.classes.map((c) => {
    const head = `${c.kind === 'class' ? 'class' : c.kind} ${c.name}`
    const fields = c.fields.map((f) => `  ${f}`)
    const methods = c.methods.map((m) => `  ${m}`)
    return [head, ...(fields.length ? ['  -- fields'] : []), ...fields, ...(methods.length ? ['  -- methods'] : []), ...methods].join('\n')
  })
  const rels = d.relations
    .filter((r) => byId.has(r.from) && byId.has(r.to))
    .map((r) => {
      const label = r.label ? ` [${r.label}]` : ''
      return `- ${byId.get(r.from)!.name} ${RELATION_INFO[r.type].verb} ${byId.get(r.to)!.name}${label}`
    })
  return [...blocks, '', 'Relationships:', ...(rels.length ? rels : ['(none)'])].join('\n')
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * A self-contained SVG (light theme, explicit colours, white background) for
 * export — it can't rely on the page's Tailwind classes or dark mode.
 */
export function diagramToSvg(d: Diagram): string {
  const ink = '#262626'
  const muted = '#525252'
  const line = '#a3a3a3'
  const accent = '#16a34a'
  const byId = new Map(d.classes.map((c) => [c.id, c]))

  // Fit the export to the content rather than the whole canvas.
  let maxX = 200
  let maxY = 120
  for (const c of d.classes) {
    const { width, height } = boxSize(c)
    maxX = Math.max(maxX, c.x + width + 20)
    maxY = Math.max(maxY, c.y + height + 20)
  }

  const defs = `<defs>
  <marker id="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M1,1 L11,6 L1,11 z" fill="#fff" stroke="${muted}"/></marker>
  <marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M1,1 L11,6 L1,11" fill="none" stroke="${muted}" stroke-width="1.5"/></marker>
  <marker id="dfill" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" orient="auto-start-reverse"><path d="M1,5 L8,1 L15,5 L8,9 z" fill="${muted}"/></marker>
  <marker id="dhollow" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" orient="auto-start-reverse"><path d="M1,5 L8,1 L15,5 L8,9 z" fill="#fff" stroke="${muted}"/></marker>
</defs>`

  const edges = d.relations
    .map((r) => {
      const from = byId.get(r.from)
      const to = byId.get(r.to)
      if (!from || !to) return ''
      const { start, end } = edgePoints(from, to)
      const style = relationStyle(r.type)
      const dash = style.dashed ? ' stroke-dasharray="5 4"' : ''
      const ms = style.markerStart ? ` marker-start="url(#${style.markerStart})"` : ''
      const me = style.markerEnd ? ` marker-end="url(#${style.markerEnd})"` : ''
      const label = r.label
        ? `<text x="${(start.x + end.x) / 2}" y="${(start.y + end.y) / 2 - 4}" font-size="10" fill="${muted}" text-anchor="middle" font-family="monospace">${esc(r.label)}</text>`
        : ''
      return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${line}" stroke-width="1.4"${dash}${ms}${me}/>${label}`
    })
    .join('\n')

  const boxes = d.classes
    .map((c) => {
      const L = sectionLayout(c)
      const st = stereotype(c.kind)
      const fields = c.fields
        .map((f, i) => `<text x="${c.x + L.padX}" y="${c.y + L.fieldsTop + 14 + i * L.lineH}" font-size="11" fill="${ink}" font-family="monospace">${esc(f)}</text>`)
        .join('')
      const methods = c.methods
        .map((m, i) => `<text x="${c.x + L.padX}" y="${c.y + L.methodsTop + 14 + i * L.lineH}" font-size="11" fill="${ink}" font-family="monospace">${esc(m)}</text>`)
        .join('')
      return `<g>
  <rect x="${c.x}" y="${c.y}" width="${L.width}" height="${L.height}" rx="6" fill="#fff" stroke="${accent}" stroke-width="1.2"/>
  ${st ? `<text x="${c.x + L.width / 2}" y="${c.y + 12}" font-size="9" fill="${muted}" text-anchor="middle" font-family="monospace">${st}</text>` : ''}
  <text x="${c.x + L.width / 2}" y="${c.y + (st ? 26 : 21)}" font-size="12" font-weight="600" fill="${ink}" text-anchor="middle" font-family="monospace"${c.kind === 'abstract' ? ' font-style="italic"' : ''}>${esc(c.name)}</text>
  <line x1="${c.x}" y1="${c.y + L.fieldsTop}" x2="${c.x + L.width}" y2="${c.y + L.fieldsTop}" stroke="${line}"/>
  <line x1="${c.x}" y1="${c.y + L.methodsTop}" x2="${c.x + L.width}" y2="${c.y + L.methodsTop}" stroke="${line}"/>
  ${fields}${methods}
</g>`
    })
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${maxX}" height="${maxY}" viewBox="0 0 ${maxX} ${maxY}">
<rect width="100%" height="100%" fill="#fff"/>
${defs}
${edges}
${boxes}
</svg>`
}

/**
 * UML notation: the arrowhead sits at the "to" end for inheritance,
 * implements, association and dependency; the diamond sits at the "from"
 * (owner) end for composition and aggregation.
 */
export function relationStyle(type: RelationType): {
  dashed: boolean
  markerStart?: 'dfill' | 'dhollow'
  markerEnd?: 'tri' | 'arrow'
} {
  switch (type) {
    case 'inheritance':
      return { dashed: false, markerEnd: 'tri' }
    case 'implements':
      return { dashed: true, markerEnd: 'tri' }
    case 'composition':
      return { dashed: false, markerStart: 'dfill' }
    case 'aggregation':
      return { dashed: false, markerStart: 'dhollow' }
    case 'association':
      return { dashed: false, markerEnd: 'arrow' }
    case 'dependency':
      return { dashed: true, markerEnd: 'arrow' }
  }
}

export { stereotype }

/** Guards a diagram restored from localStorage. */
export function isDiagram(value: unknown): value is Diagram {
  const d = value as Diagram
  return (
    !!d &&
    Array.isArray(d.classes) &&
    Array.isArray(d.relations) &&
    d.classes.every((c) => typeof c?.id === 'string' && typeof c?.name === 'string' && Array.isArray(c?.fields) && Array.isArray(c?.methods))
  )
}
