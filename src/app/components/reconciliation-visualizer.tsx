'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Row = {
  key: string
  label: string
  draft: string // uncontrolled input state held by the component instance
  fate?: 'reused' | 'reused-wrong' | 'created'
}

type Column = { title: string; rows: Row[] }

type Step = { left: Column; right: Column; note: string }

const before = (keys: [string, string]): Row[] => [
  { key: keys[0], label: 'Alice', draft: 'hi alice' },
  { key: keys[1], label: 'Bob', draft: 'hi bob' },
]

const steps: Step[] = [
  {
    left: { title: 'key={index}', rows: before(['0', '1']).map((r) => ({ ...r, draft: '' })) },
    right: { title: 'key={user.id}', rows: before(['alice', 'bob']).map((r) => ({ ...r, draft: '' })) },
    note: 'Two copies of the same list of rows, each with an uncontrolled input. The only difference is the key: array index on the left, a stable id on the right.',
  },
  {
    left: { title: 'key={index}', rows: before(['0', '1']) },
    right: { title: 'key={user.id}', rows: before(['alice', 'bob']) },
    note: 'Type a draft message into each input. That text lives in the DOM node and component instance, not in the list data.',
  },
  {
    left: {
      title: 'key={index}',
      rows: [
        { key: '0', label: 'Zoe', draft: 'hi alice', fate: 'reused-wrong' },
        { key: '1', label: 'Alice', draft: 'hi bob', fate: 'reused-wrong' },
        { key: '2', label: 'Bob', draft: '', fate: 'created' },
      ],
    },
    right: { title: 'key={user.id}', rows: before(['alice', 'bob']) },
    note: 'Insert Zoe at the top of the left list. React matches children by key: key 0 existed before, so it reuses that instance and just changes its label to Zoe. Its state — "hi alice" — comes along. Every row shifts, and Bob gets a brand-new, empty instance.',
  },
  {
    left: {
      title: 'key={index}',
      rows: [
        { key: '0', label: 'Zoe', draft: 'hi alice', fate: 'reused-wrong' },
        { key: '1', label: 'Alice', draft: 'hi bob', fate: 'reused-wrong' },
        { key: '2', label: 'Bob', draft: '', fate: 'created' },
      ],
    },
    right: {
      title: 'key={user.id}',
      rows: [
        { key: 'zoe', label: 'Zoe', draft: '', fate: 'created' },
        { key: 'alice', label: 'Alice', draft: 'hi alice', fate: 'reused' },
        { key: 'bob', label: 'Bob', draft: 'hi bob', fate: 'reused' },
      ],
    },
    note: 'Same insert on the right. Key "zoe" is new, so React creates one instance and inserts one DOM node. "alice" and "bob" are matched to their existing instances and simply moved. Every draft stays with its person.',
  },
  {
    left: {
      title: 'key={index}',
      rows: [
        { key: '0', label: 'Zoe', draft: 'hi alice', fate: 'reused-wrong' },
        { key: '1', label: 'Alice', draft: 'hi bob', fate: 'reused-wrong' },
        { key: '2', label: 'Bob', draft: '', fate: 'created' },
      ],
    },
    right: {
      title: 'key={user.id}',
      rows: [
        { key: 'zoe', label: 'Zoe', draft: '', fate: 'created' },
        { key: 'alice', label: 'Alice', draft: 'hi alice', fate: 'reused' },
        { key: 'bob', label: 'Bob', draft: 'hi bob', fate: 'reused' },
      ],
    },
    note: 'The index-keyed list is not just slower — 3 updates instead of 1 insert — it is wrong: the message typed to Alice is now addressed to Zoe. A key tells React "this is the same thing as before". Index keys make that claim about things that are not the same.',
  },
]

function ColumnView({ col }: { col: Column }) {
  return (
    <div className="flex-1">
      <div className="mb-1.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">{col.title}</div>
      <div className="space-y-1">
        {col.rows.map((row) => (
          <div
            key={`${row.key}-${row.label}`}
            className={[
              'flex items-center gap-2 rounded-lg border px-2 py-1.5 font-mono text-[10px] transition-colors duration-300',
              row.fate === 'reused-wrong'
                ? 'border-red-400/70 bg-red-500/5'
                : row.fate === 'created'
                  ? 'border-amber-500/70 bg-amber-500/5'
                  : row.fate === 'reused'
                    ? 'border-green-600/60 dark:border-green-500/60 bg-green-600/5'
                    : 'border-neutral-100 dark:border-neutral-800',
            ].join(' ')}
          >
            <span className="w-8 shrink-0 text-neutral-400 dark:text-neutral-500">{row.key}</span>
            <span className="w-9 shrink-0 text-neutral-700 dark:text-neutral-200">{row.label}</span>
            <span className="flex-1 truncate rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-neutral-600 dark:text-neutral-300">
              {row.draft || ' '}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReconciliationVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={3000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ColumnView col={step.left} />
              <ColumnView col={step.right} />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
              <span className="text-green-700 dark:text-green-400">■ reused, correct</span>
              <span className="text-red-500">■ reused, wrong state</span>
              <span className="text-amber-600 dark:text-amber-400">■ newly created</span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
