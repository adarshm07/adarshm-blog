'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Row = { id: string; label: string; isNew?: boolean }

type Step = {
  rows: Row[]
  offsetPage: string[] // labels returned by the OFFSET query
  cursorPage: string[]
  missed?: string
  duplicated?: string
  note: string
}

const base: Row[] = [
  { id: '9', label: 'post 9' },
  { id: '8', label: 'post 8' },
  { id: '7', label: 'post 7' },
  { id: '6', label: 'post 6' },
  { id: '5', label: 'post 5' },
  { id: '4', label: 'post 4' },
]

const withNew: Row[] = [{ id: '10', label: 'post 10', isNew: true }, ...base]

const steps: Step[] = [
  {
    rows: base,
    offsetPage: ['post 9', 'post 8', 'post 7'],
    cursorPage: ['post 9', 'post 8', 'post 7'],
    note: 'Page 1, three rows per page, newest first. OFFSET 0 LIMIT 3 and "WHERE id < ∞ ORDER BY id DESC LIMIT 3" return exactly the same thing.',
  },
  {
    rows: base,
    offsetPage: ['post 6', 'post 5', 'post 4'],
    cursorPage: ['post 6', 'post 5', 'post 4'],
    note: 'Page 2, on a table nobody is writing to. OFFSET 3 skips the first three; the cursor query asks for rows after id 7. Same result — the difference only shows up under writes.',
  },
  {
    rows: withNew,
    offsetPage: ['post 9', 'post 8', 'post 7'],
    cursorPage: ['post 9', 'post 8', 'post 7'],
    note: 'Now someone publishes post 10 while the reader is still on page 1. Every row shifts down by one position.',
  },
  {
    rows: withNew,
    offsetPage: ['post 7', 'post 6', 'post 5'],
    cursorPage: ['post 6', 'post 5', 'post 4'],
    missed: 'post 4',
    duplicated: 'post 7',
    note: 'The reader clicks "next". OFFSET 3 now lands one row later than it did before: post 7 appears twice, and by the end of the list post 4 gets skipped. The cursor query is unaffected — "everything after id 7" means the same thing regardless of what was inserted above it.',
  },
  {
    rows: withNew,
    offsetPage: ['post 7', 'post 6', 'post 5'],
    cursorPage: ['post 6', 'post 5', 'post 4'],
    note: 'That is the whole trade-off. An offset is a position in a result set that keeps changing; a cursor is a value in the data itself, and values do not move.',
  },
  {
    rows: withNew,
    offsetPage: ['…row 100 000', '…row 100 001', '…row 100 002'],
    cursorPage: ['post 6', 'post 5', 'post 4'],
    note: 'There is a cost side too. OFFSET 100000 makes the database walk and discard a hundred thousand rows before returning three. A cursor query seeks straight into the index and reads three — same cost on page 1 and page 30 000.',
  },
  {
    rows: withNew,
    offsetPage: ['post 7', 'post 6', 'post 5'],
    cursorPage: ['post 6', 'post 5', 'post 4'],
    note: 'The catch: the cursor column must be unique and ordered, or ties break the boundary. Sorting by a non-unique column means a composite cursor — (created_at, id) — compared as a tuple, which is also why cursors cannot jump to "page 7".',
  },
]

export function PaginationDriftVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2400}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex gap-3">
              <div className="w-24 shrink-0">
                <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  table
                </p>
                <div className="space-y-0.5">
                  {step.rows.map((row) => (
                    <div
                      key={row.id}
                      className={[
                        'rounded px-1.5 py-1 font-mono text-[10px] transition-colors duration-500',
                        row.isNew
                          ? 'bg-green-600 dark:bg-green-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
                      ].join(' ')}
                    >
                      {row.label}
                    </div>
                  ))}
                </div>
              </div>

              {[
                { title: 'OFFSET 3 LIMIT 3', page: step.offsetPage, offset: true },
                { title: 'WHERE id < 7 LIMIT 3', page: step.cursorPage, offset: false },
              ].map((panel) => (
                <div key={panel.title} className="flex-1">
                  <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    {panel.title}
                  </p>
                  <div className="space-y-0.5">
                    {panel.page.map((label) => {
                      const dup = panel.offset && step.duplicated === label
                      return (
                        <div
                          key={label}
                          className={[
                            'rounded px-1.5 py-1 font-mono text-[10px] transition-colors duration-500',
                            dup
                              ? 'bg-red-500/80 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
                          ].join(' ')}
                        >
                          {label}
                          {dup ? ' · seen on page 1' : ''}
                        </div>
                      )
                    })}
                  </div>
                  {panel.offset && step.missed && (
                    <p className="mt-1 font-mono text-[9px] text-red-500">
                      {step.missed} will be skipped
                    </p>
                  )}
                </div>
              ))}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
