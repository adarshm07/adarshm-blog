'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Entry = { k: string; v: string } // v === '†' is a tombstone

type Step = {
  memtable: Entry[]
  sstables: { name: string; entries: Entry[] }[]
  highlight?: string // name of the table being read / produced, or 'mem'
  read?: string
  note: string
}

const steps: Step[] = [
  {
    memtable: [],
    sstables: [],
    note: 'An LSM tree never updates data on disk in place. Writes go to an in-memory sorted buffer (the memtable), after being appended to a write-ahead log for durability.',
  },
  {
    memtable: [
      { k: 'cat', v: '1' },
      { k: 'dog', v: '4' },
      { k: 'emu', v: '2' },
    ],
    sstables: [],
    highlight: 'mem',
    note: 'put(dog,4), put(cat,1), put(emu,2). Each write is a log append plus an in-memory insert — no disk seek. The memtable keeps keys sorted (usually with a skip list).',
  },
  {
    memtable: [],
    sstables: [
      {
        name: 'sst-1',
        entries: [
          { k: 'cat', v: '1' },
          { k: 'dog', v: '4' },
          { k: 'emu', v: '2' },
        ],
      },
    ],
    highlight: 'sst-1',
    note: 'The memtable fills up, so it is written out as an immutable, sorted file — an SSTable — in one sequential write. The log for it can now be discarded.',
  },
  {
    memtable: [
      { k: 'ant', v: '7' },
      { k: 'cat', v: '9' },
      { k: 'dog', v: '†' },
    ],
    sstables: [
      {
        name: 'sst-1',
        entries: [
          { k: 'cat', v: '1' },
          { k: 'dog', v: '4' },
          { k: 'emu', v: '2' },
        ],
      },
    ],
    highlight: 'mem',
    note: 'put(cat,9) and delete(dog). Neither touches sst-1. The update is just a newer version; the delete is a tombstone (†) — a write that says "this key is gone".',
  },
  {
    memtable: [],
    sstables: [
      {
        name: 'sst-2',
        entries: [
          { k: 'ant', v: '7' },
          { k: 'cat', v: '9' },
          { k: 'dog', v: '†' },
        ],
      },
      {
        name: 'sst-1',
        entries: [
          { k: 'cat', v: '1' },
          { k: 'dog', v: '4' },
          { k: 'emu', v: '2' },
        ],
      },
    ],
    highlight: 'sst-2',
    note: 'Flush again. Now there are two SSTables, and cat and dog each exist in both. Newer tables shadow older ones.',
  },
  {
    memtable: [],
    sstables: [
      {
        name: 'sst-2',
        entries: [
          { k: 'ant', v: '7' },
          { k: 'cat', v: '9' },
          { k: 'dog', v: '†' },
        ],
      },
      {
        name: 'sst-1',
        entries: [
          { k: 'cat', v: '1' },
          { k: 'dog', v: '4' },
          { k: 'emu', v: '2' },
        ],
      },
    ],
    highlight: 'sst-1',
    read: 'emu',
    note: 'get(emu): check the memtable, then SSTables newest first. Not in sst-2, found in sst-1. Reads may touch several files — which is why each SSTable carries a Bloom filter to skip files that cannot contain the key.',
  },
  {
    memtable: [],
    sstables: [
      {
        name: 'sst-3',
        entries: [
          { k: 'ant', v: '7' },
          { k: 'cat', v: '9' },
          { k: 'emu', v: '2' },
        ],
      },
    ],
    highlight: 'sst-3',
    note: 'Compaction merges sst-1 and sst-2 like merge sort, keeping only the newest version of each key. cat=1 is dropped, and dog disappears entirely along with its tombstone. Fewer files, less space, faster reads.',
  },
]

function EntryRow({ e, active }: { e: Entry; active: boolean }) {
  return (
    <div
      className={[
        'flex justify-between rounded px-1.5 py-0.5 transition-colors duration-300',
        active ? 'bg-green-600/15 text-green-700 dark:text-green-400' : '',
      ].join(' ')}
    >
      <span>{e.k}</span>
      <span className={e.v === '†' ? 'text-red-500' : ''}>{e.v}</span>
    </div>
  )
}

export function LSMTreeVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="grid grid-cols-[1fr_2fr] gap-3 font-mono text-[10px]">
              <div>
                <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  memory
                </div>
                <div
                  className={[
                    'min-h-24 rounded-lg border p-1.5 transition-colors duration-300',
                    step.highlight === 'mem'
                      ? 'border-amber-500'
                      : 'border-neutral-100 dark:border-neutral-800',
                  ].join(' ')}
                >
                  <div className="mb-1 text-neutral-400 dark:text-neutral-500">memtable</div>
                  <div className="text-neutral-700 dark:text-neutral-200">
                    {step.memtable.length === 0 ? (
                      <div className="text-neutral-300 dark:text-neutral-600">empty</div>
                    ) : (
                      step.memtable.map((e) => <EntryRow key={e.k} e={e} active={false} />)
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  disk · newest first
                </div>
                <div className="flex min-h-24 gap-2">
                  {step.sstables.length === 0 ? (
                    <div className="p-1.5 text-neutral-300 dark:text-neutral-600">no SSTables yet</div>
                  ) : (
                    step.sstables.map((t) => (
                      <div
                        key={t.name}
                        className={[
                          'flex-1 rounded-lg border p-1.5 transition-colors duration-300',
                          step.highlight === t.name
                            ? 'border-green-600 dark:border-green-500'
                            : 'border-neutral-100 dark:border-neutral-800',
                        ].join(' ')}
                      >
                        <div className="mb-1 text-neutral-400 dark:text-neutral-500">{t.name}</div>
                        <div className="text-neutral-700 dark:text-neutral-200">
                          {t.entries.map((e) => (
                            <EntryRow
                              key={e.k}
                              e={e}
                              active={step.read === e.k && step.highlight === t.name}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
