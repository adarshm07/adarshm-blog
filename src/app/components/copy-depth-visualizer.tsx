'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// Object ids stand in for heap addresses; two boxes with the same id are the
// same object in memory.
type Box = { id: string; label: string; fields: { k: string; v: string; ref?: string }[] }

type Step = {
  original: Box[]
  copy: Box[]
  shared: string[] // ids reachable from both roots
  changed?: string // field shown as just-mutated, as "id.k"
  code: string
  note: string
}

const origUser: Box = {
  id: '#1',
  label: 'user',
  fields: [
    { k: 'name', v: '"Ada"' },
    { k: 'address', v: '→ #2', ref: '#2' },
  ],
}
const origAddr: Box = { id: '#2', label: 'address', fields: [{ k: 'city', v: '"Pune"' }] }

const steps: Step[] = [
  {
    original: [origUser, origAddr],
    copy: [],
    shared: [],
    code: 'const user = { name: "Ada", address: { city: "Pune" } }',
    note: 'Two objects on the heap: the user (#1) and the address it points to (#2). The address field does not contain the address — it holds a reference to it.',
  },
  {
    original: [origUser, origAddr],
    copy: [{ ...origUser, id: '#3', label: 'copy' }],
    shared: ['#2'],
    code: 'const copy = { ...user }',
    note: 'Spread creates a new top-level object (#3) and copies each property value. name is a string, copied by value. address is a reference, so the reference is copied — both objects now point at the same #2.',
  },
  {
    original: [origUser, origAddr],
    copy: [
      {
        id: '#3',
        label: 'copy',
        fields: [
          { k: 'name', v: '"Grace"' },
          { k: 'address', v: '→ #2', ref: '#2' },
        ],
      },
    ],
    shared: ['#2'],
    changed: '#3.name',
    code: 'copy.name = "Grace"',
    note: 'Changing a top-level field on the copy is safe. It writes to #3; user.name is still "Ada".',
  },
  {
    original: [origUser, { ...origAddr, fields: [{ k: 'city', v: '"Oslo"' }] }],
    copy: [
      {
        id: '#3',
        label: 'copy',
        fields: [
          { k: 'name', v: '"Grace"' },
          { k: 'address', v: '→ #2', ref: '#2' },
        ],
      },
    ],
    shared: ['#2'],
    changed: '#2.city',
    code: 'copy.address.city = "Oslo"',
    note: 'But copy.address is #2 — the same object user.address points to. Mutating it changes the "original" too: user.address.city is now "Oslo". This is the shallow-copy bug.',
  },
  {
    original: [origUser, origAddr],
    copy: [
      { ...origUser, id: '#4', label: 'deep', fields: [{ k: 'name', v: '"Ada"' }, { k: 'address', v: '→ #5', ref: '#5' }] },
      { ...origAddr, id: '#5' },
    ],
    shared: [],
    code: 'const deep = structuredClone(user)',
    note: 'structuredClone walks the whole graph and copies every object it reaches: #4 and #5 are new. Nothing is shared, so no mutation on one side can leak to the other.',
  },
]

function BoxView({ box, shared, changed }: { box: Box; shared: boolean; changed?: string }) {
  return (
    <div
      className={[
        'rounded-lg border p-1.5 transition-colors duration-300',
        shared
          ? 'border-amber-500 bg-amber-500/5'
          : 'border-neutral-200 dark:border-neutral-700',
      ].join(' ')}
    >
      <div className="mb-0.5 text-neutral-400 dark:text-neutral-500">
        {box.label} <span className="text-neutral-300 dark:text-neutral-600">{box.id}</span>
      </div>
      {box.fields.map((f) => (
        <div
          key={f.k}
          className={[
            'flex justify-between gap-2 rounded px-1',
            changed === `${box.id}.${f.k}` ? 'bg-red-500/15 text-red-600 dark:text-red-400' : '',
          ].join(' ')}
        >
          <span>{f.k}</span>
          <span className={f.ref ? 'text-neutral-400 dark:text-neutral-500' : ''}>{f.v}</span>
        </div>
      ))}
    </div>
  )
}

export function CopyDepthVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 overflow-x-auto whitespace-pre rounded-lg bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5 font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
              {step.code}
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-[10px] text-neutral-700 dark:text-neutral-200">
              <div className="space-y-1.5">
                <div className="uppercase tracking-wide text-neutral-400 dark:text-neutral-500">reachable from user</div>
                {step.original.map((b) => (
                  <BoxView key={b.id} box={b} shared={step.shared.includes(b.id)} changed={step.changed} />
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="uppercase tracking-wide text-neutral-400 dark:text-neutral-500">reachable from copy</div>
                {step.copy.length === 0 ? (
                  <div className="text-neutral-300 dark:text-neutral-600">—</div>
                ) : (
                  step.copy.map((b) => (
                    <BoxView key={b.id} box={b} shared={false} changed={step.changed} />
                  ))
                )}
                {step.shared.length > 0 ? (
                  <div className="text-amber-600 dark:text-amber-400">
                    + {step.shared.join(', ')} (shared with user)
                  </div>
                ) : null}
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
