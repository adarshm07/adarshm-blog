'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const CODE = [
  'const user = {',
  "  name: 'Ada',",
  '  hi() { return this.name },',
  '}',
  "const admin = { name: 'Grace' }",
  '',
  'user.hi()',
  'const hi = user.hi;  hi()',
  'hi.call(admin)',
  'function Person(n) { this.name = n }',
  "new Person('Linus')",
  'user.later = function () {',
  '  setTimeout(() => this.name)',
  '}',
]

type Step = {
  line: number | null
  rule: string
  thisValue: string
  result: string
  tone?: 'ok' | 'bad'
  note: string
}

// Assumes module / strict mode, where a plain call leaves this undefined.
const steps: Step[] = [
  {
    line: null,
    rule: '—',
    thisValue: '—',
    result: '—',
    note: 'this is not decided where a function is written. It is decided each time the function is called, by how the call looks. Four rules cover almost every case.',
  },
  {
    line: 6,
    rule: '1 · method call',
    thisValue: 'user',
    result: "'Ada'",
    tone: 'ok',
    note: 'Called as obj.method(): this is the object to the left of the dot. Here that is user, so this.name is "Ada".',
  },
  {
    line: 7,
    rule: '2 · plain call',
    thisValue: 'undefined',
    result: 'TypeError',
    tone: 'bad',
    note: 'Copy the same function into a variable and call it bare. There is no dot, so there is no object: this is undefined (in modules and strict mode), and reading .name throws. This is the classic "lost this" bug when passing a method as a callback.',
  },
  {
    line: 8,
    rule: '3 · explicit',
    thisValue: 'admin',
    result: "'Grace'",
    tone: 'ok',
    note: 'call, apply and bind let you choose this yourself. hi.call(admin) runs the same function with this = admin. bind returns a new function with this fixed permanently — the usual fix for rule 2.',
  },
  {
    line: 10,
    rule: '4 · new',
    thisValue: '{ } (a new object)',
    result: "{ name: 'Linus' }",
    tone: 'ok',
    note: 'With new, the engine creates a fresh object, links it to Person.prototype, runs the function with this pointing at it, and returns it.',
  },
  {
    line: 12,
    rule: 'arrow functions',
    thisValue: 'this of the enclosing function',
    result: "'Ada' when called as user.later()",
    tone: 'ok',
    note: 'Arrow functions ignore all four rules. They have no this of their own and use the one from the surrounding code — here, later()\'s this, which is user. That is why arrows are the natural choice for callbacks inside methods.',
  },
]

export function ThisBindingVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="overflow-x-auto rounded-lg bg-neutral-50 dark:bg-neutral-900 p-2">
              {CODE.map((line, i) => (
                <div
                  key={i}
                  className={[
                    'whitespace-pre rounded px-1.5 font-mono text-[10.5px] leading-relaxed transition-colors duration-300',
                    step.line === i
                      ? 'bg-amber-500/20 text-neutral-900 dark:text-neutral-50'
                      : 'text-neutral-500 dark:text-neutral-400',
                  ].join(' ')}
                >
                  {line || ' '}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">rule</div>
                <div className="text-neutral-700 dark:text-neutral-200">{step.rule}</div>
              </div>
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">this =</div>
                <div
                  className={
                    step.tone === 'bad'
                      ? 'text-red-500'
                      : 'text-green-700 dark:text-green-400'
                  }
                >
                  {step.thisValue}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">result</div>
                <div
                  className={
                    step.tone === 'bad' ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-200'
                  }
                >
                  {step.result}
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
