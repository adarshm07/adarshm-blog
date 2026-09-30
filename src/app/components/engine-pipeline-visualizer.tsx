'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const STAGES = ['source', 'parser', 'interpreter', 'optimizer'] as const
type Stage = (typeof STAGES)[number]

const STAGE_LABEL: Record<Stage, string> = {
  source: 'Source',
  parser: 'Parser → AST',
  interpreter: 'Interpreter',
  optimizer: 'Optimizing compiler',
}

type Step = {
  stage: Stage
  title: string
  lines: string[]
  tone?: 'hot' | 'fast' | 'bail'
  note: string
}

// Bytecode and machine code are simplified to show the shape of each stage,
// not an exact dump from any engine.
const steps: Step[] = [
  {
    stage: 'source',
    title: 'your code',
    lines: [
      'function add(a, b) {',
      '  return a + b',
      '}',
      '',
      'for (let i = 0; i < 10000; i++) add(i, 1)',
      "add('a', 'b')",
    ],
    note: 'To the engine, a script starts as a string of characters. Nothing has run yet. Engines like V8 (Chrome, Node), SpiderMonkey (Firefox) and JavaScriptCore (Safari) all take it through the same broad stages.',
  },
  {
    stage: 'parser',
    title: 'tokens',
    lines: ['function · add · ( · a · , · b · ) · {', 'return · a · + · b · }'],
    note: 'First the characters are split into tokens — keywords, names, punctuation. Syntax errors are caught here, before any line runs, which is why one typo stops the whole file.',
  },
  {
    stage: 'parser',
    title: 'abstract syntax tree',
    lines: [
      'FunctionDeclaration  add',
      '├─ params: a, b',
      '└─ ReturnStatement',
      '   └─ BinaryExpression  +',
      '      ├─ Identifier  a',
      '      └─ Identifier  b',
    ],
    note: 'Tokens become a tree that captures the meaning: a function named add, with two parameters, returning a + b. Scopes and declarations are worked out at this stage — which is where hoisting comes from.',
  },
  {
    stage: 'interpreter',
    title: 'bytecode',
    lines: ['load   b', 'add    a', 'return'],
    note: 'The tree is turned into compact bytecode, and an interpreter starts running it immediately. Startup is fast; each instruction is slower than native code, but most code only runs a few times, so this is the right trade.',
  },
  {
    stage: 'interpreter',
    title: 'profiling',
    lines: ['add() called 10,000 times', 'a: always a small integer', 'b: always a small integer'],
    tone: 'hot',
    note: 'While interpreting, the engine records what it sees: how often each function runs and what types flow through it. add is now "hot", and it has only ever seen numbers.',
  },
  {
    stage: 'optimizer',
    title: 'optimized machine code',
    lines: ['check a, b are integers  → else bail out', 'add   r1, r2', 'return r1'],
    tone: 'fast',
    note: 'A hot function is handed to the optimizing compiler, which bets on the types it observed and emits machine code specialized for integers — often many times faster than the bytecode.',
  },
  {
    stage: 'interpreter',
    title: 'deoptimization',
    lines: ["add('a', 'b')", 'type check failed: a is a string', '→ discard optimized code, back to bytecode'],
    tone: 'bail',
    note: 'Then add is called with strings. The bet is wrong, so the engine throws the optimized code away and falls back to the interpreter. Your program is still correct — it just got slower. Code that keeps its types consistent stays fast.',
  },
]

export function EnginePipelineVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={3000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="grid grid-cols-4 gap-1">
              {STAGES.map((stage) => {
                const active = stage === step.stage
                return (
                  <div
                    key={stage}
                    className={[
                      'flex min-h-10 items-center justify-center rounded-lg px-1 text-center font-mono text-[10px] leading-tight transition-colors duration-300',
                      active
                        ? step.tone === 'bail'
                          ? 'bg-red-500 text-white'
                          : step.tone === 'fast'
                            ? 'bg-green-600 dark:bg-green-500 text-white'
                            : 'bg-amber-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
                    ].join(' ')}
                  >
                    {STAGE_LABEL[stage]}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 rounded-lg border border-neutral-100 dark:border-neutral-800 p-2.5">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                {step.title}
              </div>
              <div className="min-h-24 overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                {step.lines.join('\n')}
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
