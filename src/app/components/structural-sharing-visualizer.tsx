'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type NodeSpec = { id: string; label: string; x: number; y: number }

const V1: NodeSpec[] = [
  { id: 'state', label: 'state', x: 72, y: 20 },
  { id: 'user', label: 'user', x: 26, y: 72 },
  { id: 'settings', label: 'settings', x: 118, y: 72 },
  { id: 'name', label: 'name', x: 8, y: 124 },
  { id: 'email', label: 'email', x: 52, y: 124 },
  { id: 'theme', label: 'theme', x: 96, y: 124 },
  { id: 'lang', label: 'lang', x: 140, y: 124 },
]

const V1_EDGES: [string, string][] = [
  ['state', 'user'],
  ['state', 'settings'],
  ['user', 'name'],
  ['user', 'email'],
  ['settings', 'theme'],
  ['settings', 'lang'],
]

const V2: NodeSpec[] = [
  { id: "state'", label: 'state', x: 236, y: 20 },
  { id: "settings'", label: 'settings', x: 236, y: 72 },
  { id: "theme'", label: 'theme', x: 214, y: 124 },
]

const V2_EDGES: [string, string][] = [
  ["state'", "settings'"],
  ["settings'", "theme'"],
]

// Edges from the new version back into nodes of the old one.
const SHARED_EDGES: [string, string][] = [
  ["state'", 'user'],
  ["settings'", 'lang'],
]

const POS = new Map([...V1, ...V2].map((n) => [n.id, n]))

type Step = {
  copied: string[] // v1 ids highlighted as "would be copied"
  newNodes: string[] // v2 ids visible
  shared: boolean
  sharedGlow: boolean
  note: string
}

const steps: Step[] = [
  {
    copied: [],
    newNodes: [],
    shared: false,
    sharedGlow: false,
    note: 'An immutable state tree. We want to change one leaf — the theme — without mutating anything.',
  },
  {
    copied: V1.map((n) => n.id),
    newNodes: [],
    shared: false,
    sharedGlow: false,
    note: 'The naive approach is a deep clone: copy every node, then set the new theme. Correct, but the cost is the size of the whole tree for a one-field change — and every consumer now sees a brand new object, so everything re-renders.',
  },
  {
    copied: [],
    newNodes: ["state'"],
    shared: false,
    sharedGlow: false,
    note: 'Structural sharing copies only what actually changed. The root must be new, because its contents differ.',
  },
  {
    copied: [],
    newNodes: ["state'", "settings'", "theme'"],
    shared: false,
    sharedGlow: false,
    note: 'So must settings, which holds the changed theme, and theme itself. That is the entire copy: the path from the root to the changed leaf — O(depth), not O(size).',
  },
  {
    copied: [],
    newNodes: ["state'", "settings'", "theme'"],
    shared: true,
    sharedGlow: false,
    note: 'Everything untouched is reused by reference. The new root points at the very same user object as the old one, and the new settings points at the same lang. Nothing was copied, and nothing was mutated.',
  },
  {
    copied: [],
    newNodes: ["state'", "settings'", "theme'"],
    shared: true,
    sharedGlow: true,
    note: 'Now both versions are valid trees that share most of their memory — which is why undo/redo is just keeping the old root around. And since prev.user === next.user, a component that reads user can skip re-rendering after a single === check, with no deep comparison anywhere.',
  },
]

function NodeBox({
  node,
  variant,
}: {
  node: NodeSpec
  variant: 'plain' | 'copied' | 'new' | 'shared'
}) {
  const fill =
    variant === 'copied'
      ? 'fill-amber-500'
      : variant === 'new'
        ? 'fill-green-600 dark:fill-green-500'
        : variant === 'shared'
          ? 'fill-green-600/25 dark:fill-green-500/25'
          : 'fill-neutral-100 dark:fill-neutral-800'
  const text =
    variant === 'copied' || variant === 'new'
      ? 'fill-white'
      : 'fill-neutral-600 dark:fill-neutral-300'
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={44}
        height={20}
        rx={5}
        className={`${fill} transition-colors duration-500`}
      />
      <text
        x={node.x + 22}
        y={node.y + 14}
        textAnchor="middle"
        className={`font-mono text-[8px] ${text}`}
      >
        {node.label}
      </text>
    </g>
  )
}

function edgePath(a: string, b: string) {
  const pa = POS.get(a)!
  const pb = POS.get(b)!
  return {
    x1: pa.x + 22,
    y1: pa.y + 20,
    x2: pb.x + 22,
    y2: pb.y,
  }
}

export function StructuralSharingVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2100}>
      {(index) => {
        const step = steps[index]
        const sharedTargets = step.shared ? ['user', 'name', 'email', 'lang'] : []
        return (
          <>
            <svg
              viewBox="0 0 300 156"
              className="mx-auto block w-full"
              role="img"
              aria-label="An immutable state tree and an updated version sharing most of its nodes"
            >
              <text x={72} y={12} textAnchor="middle" className="font-mono text-[7px] fill-neutral-400">
                version 1
              </text>
              {step.newNodes.length > 0 && (
                <text x={240} y={12} textAnchor="middle" className="font-mono text-[7px] fill-neutral-400">
                  version 2
                </text>
              )}

              {V1_EDGES.map(([a, b], i) => {
                const e = edgePath(a, b)
                return (
                  <line
                    key={`v1${i}`}
                    {...e}
                    className="stroke-neutral-200 dark:stroke-neutral-700"
                    strokeWidth={1}
                  />
                )
              })}

              {step.newNodes.length > 0 &&
                V2_EDGES.filter(([a, b]) => step.newNodes.includes(a) && step.newNodes.includes(b)).map(
                  ([a, b], i) => {
                    const e = edgePath(a, b)
                    return (
                      <line
                        key={`v2${i}`}
                        {...e}
                        className="stroke-green-600 dark:stroke-green-500"
                        strokeWidth={1.5}
                      />
                    )
                  }
                )}

              {step.shared &&
                SHARED_EDGES.map(([a, b], i) => {
                  const pa = POS.get(a)!
                  const pb = POS.get(b)!
                  return (
                    <path
                      key={`sh${i}`}
                      d={`M ${pa.x} ${pa.y + 10} C ${pa.x - 50} ${pa.y + 10}, ${pb.x + 90} ${pb.y + 10}, ${pb.x + 44} ${pb.y + 10}`}
                      className={
                        step.sharedGlow
                          ? 'stroke-green-600 dark:stroke-green-500'
                          : 'stroke-neutral-400 dark:stroke-neutral-500'
                      }
                      strokeWidth={1.2}
                      strokeDasharray="3 2"
                      fill="none"
                    />
                  )
                })}

              {V1.map((n) => (
                <NodeBox
                  key={n.id}
                  node={n}
                  variant={
                    step.copied.includes(n.id)
                      ? 'copied'
                      : step.sharedGlow && sharedTargets.includes(n.id)
                        ? 'shared'
                        : 'plain'
                  }
                />
              ))}
              {V2.filter((n) => step.newNodes.includes(n.id)).map((n) => (
                <NodeBox key={n.id} node={n} variant="new" />
              ))}
            </svg>
            <p className="mt-1 text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              green = newly allocated · dashed = reused by reference
            </p>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
