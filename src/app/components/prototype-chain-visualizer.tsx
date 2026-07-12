'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Level = {
  label: string
  sub: string
  has: string[]
}

const LEVELS: Level[] = [
  { label: 'dog', sub: "{ name: 'Rex' }", has: ['name'] },
  { label: 'Dog.prototype', sub: '{ bark() }', has: ['bark'] },
  { label: 'Animal.prototype', sub: '{ eat() }', has: ['eat'] },
  { label: 'Object.prototype', sub: '{ toString(), … }', has: ['toString', 'hasOwnProperty'] },
  { label: 'null', sub: 'end of the chain', has: [] },
]

type Step = {
  active: number // index into LEVELS currently being checked, -1 = idle
  found?: number // index where the property was found
  note: string
}

// Walking the lookup of dog.eat()
const steps: Step[] = [
  {
    active: -1,
    note: 'We call dog.eat(). The engine needs to find an "eat" property. Press play to watch it walk the chain.',
  },
  {
    active: 0,
    note: 'Check the instance dog itself. It only has "name" — miss. Follow the [[Prototype]] link up.',
  },
  {
    active: 1,
    note: 'Check Dog.prototype. It has "bark" but no "eat" — miss. Keep walking up the chain.',
  },
  {
    active: 2,
    found: 2,
    note: 'Check Animal.prototype. It has "eat" — hit! The engine stops here and calls it with this = dog.',
  },
]

export function PrototypeChainVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-col items-center gap-0">
              {LEVELS.map((level, i) => {
                const isNull = level.label === 'null'
                const isActive = step.active === i
                const isFound = step.found === i
                const isChecked = step.active >= 0 && i < step.active
                return (
                  <div key={level.label} className="flex flex-col items-center">
                    {i > 0 && (
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            'h-6 w-0.5 transition-colors duration-200',
                            step.active >= i
                              ? 'bg-neutral-400 dark:bg-neutral-500'
                              : 'bg-neutral-200 dark:bg-neutral-700',
                          ].join(' ')}
                        />
                        <span className="mb-1 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                          [[Prototype]] ↑
                        </span>
                      </div>
                    )}
                    {isNull ? (
                      <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
                        null — top of the chain
                      </span>
                    ) : (
                      <div
                        className={[
                          'w-56 rounded-lg border px-3 py-2 text-center transition-all duration-300',
                          isFound
                            ? 'border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500'
                            : isActive
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : isChecked
                                ? 'border-neutral-200 bg-neutral-50 text-neutral-400 line-through dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600'
                                : 'border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                        ].join(' ')}
                      >
                        <div className="font-mono text-xs">{level.label}</div>
                        <div
                          className={[
                            'font-mono text-[10px]',
                            isActive || isFound
                              ? 'text-white/80'
                              : 'text-neutral-400 dark:text-neutral-500',
                          ].join(' ')}
                        >
                          {level.sub}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
