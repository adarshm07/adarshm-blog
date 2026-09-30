'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Step = {
  expr: string
  chain: string[] // each intermediate form, ending with the result
  surprising?: boolean
  note: string
}

// Every chain was checked by evaluating the expression in Node.
const steps: Step[] = [
  {
    expr: "'5' + 1",
    chain: ["'5' + '1'", "'51'"],
    surprising: true,
    note: 'When either side of + is a string, + means "join text". The number 1 is converted to the string "1", and the result is "51", not 6.',
  },
  {
    expr: "'5' - 1",
    chain: ['5 - 1', '4'],
    note: 'Minus only works on numbers, so there is no ambiguity: "5" is converted to 5. Same for *, / and %. Only + has the text-joining meaning.',
  },
  {
    expr: '[] + {}',
    chain: ["'' + '[object Object]'", "'[object Object]'"],
    surprising: true,
    note: 'Objects are first turned into primitives. An empty array becomes the empty string (its items joined), a plain object becomes "[object Object]". Now one side is a string, so + joins them.',
  },
  {
    expr: "1 == '1'",
    chain: ['1 == 1', 'true'],
    note: 'Loose equality converts before comparing: when a number meets a string, the string is converted to a number. 1 === "1" would be false, because === never converts.',
  },
  {
    expr: "0 == ''",
    chain: ['0 == 0', 'true'],
    surprising: true,
    note: 'The empty string converts to the number 0, so 0 == "" is true. This is the kind of accidental match that makes == risky with user input.',
  },
  {
    expr: '[] == ![]',
    chain: ['[] == false', '[] == 0', "'' == 0", '0 == 0', 'true'],
    surprising: true,
    note: 'The famous one. ![] is false (every object is truthy). Then a boolean is converted to a number, the array to a primitive (""), and "" to 0. Each step follows a rule; together they give nonsense.',
  },
  {
    expr: "if ([]) … if ('0') … if ('') …",
    chain: ['truthy', 'truthy', 'falsy'],
    note: 'In conditions, only eight values are falsy: false, 0, -0, 0n, "", null, undefined and NaN. Everything else — including [], {} and the string "0" — is truthy. Use === by default, and convert explicitly with Number() or String() when you mean to.',
  },
]

export function CoercionVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={3000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 px-3 py-3 text-center font-mono text-[15px] text-neutral-900 dark:text-neutral-50">
              {step.expr}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[11px]">
              {step.chain.map((form, i) => {
                const last = i === step.chain.length - 1
                return (
                  <div key={`${index}-${i}`} className="flex items-center gap-1.5">
                    <span className="text-neutral-300 dark:text-neutral-600">→</span>
                    <span
                      className={[
                        'rounded-md px-2 py-1',
                        last
                          ? step.surprising
                            ? 'bg-amber-500 text-white'
                            : 'bg-green-600 dark:bg-green-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
                      ].join(' ')}
                    >
                      {form}
                    </span>
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
