'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Level = {
  label: string
  props: string
  has: boolean // whether it holds the property being looked up
}

const CHAIN: Level[] = [
  { label: 'dog', props: "{ name: 'Rex' }", has: false },
  { label: 'Dog.prototype', props: '{ bark() }', has: false },
  { label: 'Animal.prototype', props: '{ eat() }', has: true },
  { label: 'Object.prototype', props: '{ toString(), … }', has: false },
  { label: 'null', props: 'end of the chain', has: false },
]

type Step = {
  // index of the level currently being checked; -1 = intro
  checking: number
  found: boolean
  note: string
}

const steps: Step[] = [
  {
    checking: -1,
    found: false,
    note: 'Calling dog.eat(). The engine looks up "eat" starting at the instance and walking the [[Prototype]] chain.',
  },
  {
    checking: 0,
    found: false,
    note: 'Check the dog instance itself. It has "name" but no "eat" — miss. Follow the [[Prototype]] link up.',
  },
  {
    checking: 1,
    found: false,
    note: 'Check Dog.prototype. It has "bark" but no "eat" — miss. Keep walking up.',
  },
  {
    checking: 2,
    found: true,
    note: 'Check Animal.prototype. Found "eat"! The search stops here and the method runs with this = dog.',
  },
  {
    checking: 2,
    found: true,
    note: 'Result: "Rex is eating". One shared eat() on Animal.prototype serves every animal — no copying onto instances.',
  },
]

export function PrototypeChainVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 flex items-center gap-2 font-mono text-xs">
              <span className="text-neutral-500 dark:text-neutral-400">
                looking up:
              </span>
              <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-neutral-700 dark:text-neutral-300">
                dog.eat
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {CHAIN.map((level, i) => {
                const isChecking = step.checking === i
                const isFound = isChecking && step.found
                const isMiss = isChecking && !step.found && level.label !== 'null'
                const isNull = level.label === 'null'
                return (
                  <div key={level.label} className="flex flex-col items-center">
                    <div
                      className={[
                        'w-full max-w-xs rounded-lg border px-3 py-2 transition-all duration-200',
                        isFound
                          ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950'
                          : isMiss
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : isNull
                              ? 'border-transparent'
                              : 'border-neutral-100 dark:border-neutral-800',
                      ].join(' ')}
                    >
                      {isNull ? (
                        <div className="text-center font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                          null — top of the chain
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                              {level.label}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                              {level.props}
                            </span>
                          </div>
                          {isFound && (
                            <span className="rounded bg-green-600 dark:bg-green-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              found ✓
                            </span>
                          )}
                          {isMiss && (
                            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              miss
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {i < CHAIN.length - 1 && (
                      <div className="flex flex-col items-center py-0.5">
                        <span
                          className={[
                            'text-xs leading-none transition-colors duration-200',
                            step.checking >= 0 && step.checking > i && !step.found
                              ? 'text-amber-500'
                              : step.found && step.checking > i
                                ? 'text-green-600 dark:text-green-500'
                                : 'text-neutral-300 dark:text-neutral-600',
                          ].join(' ')}
                        >
                          ↑
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                          [[Prototype]]
                        </span>
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
