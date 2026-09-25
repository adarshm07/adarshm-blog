'use client'

import { useRef, useState } from 'react'

type Measurement = { length: number; ms: number; timedOut: boolean }

type Result = {
  measurements: Measurement[]
  verdict: 'safe' | 'suspicious' | 'catastrophic'
  growth: number
}

/**
 * The regex runs inside a worker, because a catastrophic pattern would freeze
 * the page if it ran on the main thread — the worker can be terminated.
 */
const WORKER_SOURCE = `
self.onmessage = (e) => {
  const { source, flags, input } = e.data
  try {
    const re = new RegExp(source, flags)
    const start = performance.now()
    re.test(input)
    self.postMessage({ ok: true, ms: performance.now() - start })
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message ? err.message : err) })
  }
}
`

const LENGTHS = [10, 16, 22, 28, 34, 40]
const TIMEOUT_MS = 2000

/** Structural tell: a quantified group that itself contains a quantifier. */
function hasNestedQuantifier(source: string) {
  return /\([^()]*[+*][^()]*\)\s*[+*{]/.test(source)
}

export function RegexSafetyChecker() {
  const [pattern, setPattern] = useState('^(a+)+$')
  const [flags, setFlags] = useState('')
  const [attack, setAttack] = useState('a')
  const [suffix, setSuffix] = useState('!')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  function runOnce(input: string): Promise<{ ms: number; timedOut: boolean }> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)
      const worker = new Worker(url)
      workerRef.current = worker

      const timer = setTimeout(() => {
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve({ ms: TIMEOUT_MS, timedOut: true })
      }, TIMEOUT_MS)

      worker.onmessage = (e) => {
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        if (e.data.ok) resolve({ ms: e.data.ms, timedOut: false })
        else reject(new Error(e.data.error))
      }

      worker.postMessage({ source: pattern, flags, input })
    })
  }

  async function analyse() {
    setRunning(true)
    setError('')
    setResult(null)

    try {
      new RegExp(pattern, flags) // fail fast on an invalid pattern
      const measurements: Measurement[] = []

      for (const length of LENGTHS) {
        const input = attack.repeat(length) + suffix
        const { ms, timedOut } = await runOnce(input)
        measurements.push({ length, ms, timedOut })
        if (timedOut) break
      }

      const last = measurements[measurements.length - 1]
      const first = measurements[0]
      const growth = last.ms / Math.max(first.ms, 0.01)
      const verdict: Result['verdict'] = last.timedOut
        ? 'catastrophic'
        : growth > 50 || last.ms > 100
          ? 'suspicious'
          : 'safe'

      setResult({ measurements, verdict, growth })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setRunning(false)
    }
  }

  const maxMs = Math.max(...(result?.measurements.map((m) => m.ms) ?? [1]), 1)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-neutral-600 dark:text-neutral-300">Pattern</span>
          <div className="mt-1 flex gap-2">
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              className="flex-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 font-mono text-sm text-neutral-900 dark:text-neutral-50 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
            />
            <input
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="flags"
              spellCheck={false}
              className="w-20 rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 font-mono text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none"
            />
          </div>
        </label>

        <div className="flex gap-3">
          <label className="flex-1">
            <span className="text-xs text-neutral-600 dark:text-neutral-300">Repeated chunk</span>
            <input
              value={attack}
              onChange={(e) => setAttack(e.target.value)}
              spellCheck={false}
              className="mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 font-mono text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none"
            />
          </label>
          <label className="flex-1">
            <span className="text-xs text-neutral-600 dark:text-neutral-300">
              Failing suffix
            </span>
            <input
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              spellCheck={false}
              className="mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 font-mono text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none"
            />
          </label>
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          The test input is the chunk repeated N times plus the suffix — a long
          valid-looking prefix that cannot match, which is the shape that triggers
          backtracking.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={analyse}
            disabled={running}
            className="rounded-md bg-green-600 dark:bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {running ? 'Testing…' : 'Test it'}
          </button>
          {hasNestedQuantifier(pattern) && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Structural warning: a quantifier inside a quantified group
            </span>
          )}
          {error && <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span>}
        </div>
      </div>

      {result && (
        <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Time by input length
            </h2>
            <span
              className={[
                'font-mono text-xs',
                result.verdict === 'catastrophic'
                  ? 'text-rose-600 dark:text-rose-400'
                  : result.verdict === 'suspicious'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-500',
              ].join(' ')}
            >
              {result.verdict === 'catastrophic'
                ? 'catastrophic backtracking'
                : result.verdict === 'suspicious'
                  ? 'superlinear — look closer'
                  : 'linear — looks safe'}
            </span>
          </div>

          <div className="space-y-1.5">
            {result.measurements.map((m) => (
              <div key={m.length} className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
                  {m.length} chars
                </span>
                <div className="h-3 flex-1 rounded bg-neutral-50 dark:bg-neutral-900">
                  <div
                    className={[
                      'h-full rounded transition-all duration-300',
                      m.timedOut ? 'bg-rose-500' : m.ms > 100 ? 'bg-amber-500' : 'bg-green-600 dark:bg-green-500',
                    ].join(' ')}
                    style={{ width: `${Math.max((m.ms / maxMs) * 100, 1.5)}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-[10px] tabular-nums text-neutral-500 dark:text-neutral-400">
                  {m.timedOut ? `>${TIMEOUT_MS}ms` : `${m.ms.toFixed(m.ms < 10 ? 2 : 0)}ms`}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {result.verdict === 'catastrophic'
              ? `This pattern stopped finishing within ${TIMEOUT_MS}ms at ${result.measurements.at(-1)?.length} characters. On a server, a request carrying that input pins a CPU core.`
              : result.verdict === 'suspicious'
                ? `Time grew ${result.growth.toFixed(0)}× across the range. That is not linear — extend the lengths or look for ambiguity in the pattern.`
                : 'Time stayed flat as the input grew, which is what a non-ambiguous pattern looks like.'}
          </p>
        </div>
      )}
    </div>
  )
}
