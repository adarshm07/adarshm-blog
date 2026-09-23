'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Step = {
  emitted?: string
  valid?: boolean
  error?: string
  result?: string
  highlight?: 'schema' | 'model' | 'validate' | 'execute'
  note: string
}

const SCHEMA = `{
  name: "search_orders",
  description: "Find orders for a customer.
    Use when the user asks about an order's
    status, contents, or delivery date.",
  input_schema: {
    type: "object",
    properties: {
      customer_id: { type: "string" },
      status: { enum: ["open","shipped"] },
      limit: { type: "integer" }
    },
    required: ["customer_id"],
    additionalProperties: false
  }
}`

const steps: Step[] = [
  {
    highlight: 'schema',
    note: 'A tool is a name, a description, and a JSON Schema. The description is the part that decides whether the model reaches for it at all — it is prompt text, not documentation.',
  },
  {
    highlight: 'model',
    emitted: '{ "customer_id": "c_',
    note: 'The model does not call anything. It emits a tool_use block whose input is generated token by token — which is why a truncated response can leave you with half-written JSON.',
  },
  {
    highlight: 'model',
    emitted: '{ "customer_id": "c_8812", "status": "open" }',
    note: 'The complete arguments arrive, and stop_reason comes back as "tool_use". The optional fields it skipped are simply absent — your handler needs defaults, not assumptions.',
  },
  {
    highlight: 'validate',
    emitted: '{ "customer_id": "c_8812", "status": "open" }',
    valid: true,
    note: 'Validate against the same schema you sent. With strict mode the API guarantees a schema-valid input; without it, treat the arguments as untrusted input from a very capable but occasionally creative caller.',
  },
  {
    highlight: 'execute',
    emitted: '{ "customer_id": "c_8812", "status": "open" }',
    valid: true,
    result: '{ "orders": [ … 3 items ] }',
    note: 'Your code runs the function and returns a tool_result block keyed by the tool_use id. Ids matter when several calls are in flight at once.',
  },
  {
    highlight: 'model',
    emitted: '{ "customer_id": "c_8812", "status": "pending" }',
    note: 'Now a failure case. The model invents a status value that is not in the enum — plausible English, invalid argument.',
  },
  {
    highlight: 'validate',
    emitted: '{ "customer_id": "c_8812", "status": "pending" }',
    valid: false,
    error: 'status: "pending" is not one of ["open","shipped"]',
    note: 'Validation catches it. Do not throw — return a tool_result with is_error: true and the validator message in the body.',
  },
  {
    highlight: 'model',
    emitted: '{ "customer_id": "c_8812", "status": "open" }',
    valid: true,
    result: '{ "orders": [ … 3 items ] }',
    note: 'Given the error text, the model corrects itself on the next turn. A precise error message is a repair instruction; "invalid input" is a dead end that costs you another round trip.',
  },
]

export function ToolCallVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  tool definition (you send this)
                </p>
                <pre
                  className={[
                    'overflow-x-auto rounded-lg border p-2.5 font-mono text-[9px] leading-relaxed transition-colors duration-300',
                    step.highlight === 'schema'
                      ? 'border-green-600/50 dark:border-green-500/50 bg-green-600/5'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900',
                  ].join(' ')}
                >
                  <code className="text-neutral-600 dark:text-neutral-300">{SCHEMA}</code>
                </pre>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    model emits
                  </p>
                  <div
                    className={[
                      'min-h-10 rounded-lg border px-2.5 py-2 font-mono text-[10px] break-all transition-colors duration-300',
                      step.highlight === 'model'
                        ? 'border-green-600/50 dark:border-green-500/50 bg-green-600/5'
                        : 'border-neutral-200 dark:border-neutral-800',
                    ].join(' ')}
                  >
                    {step.emitted ? (
                      <>
                        <span className="text-neutral-400 dark:text-neutral-500">
                          tool_use · search_orders
                          <br />
                        </span>
                        <span className="text-neutral-700 dark:text-neutral-200">
                          {step.emitted}
                        </span>
                        {step.emitted.endsWith('_') && (
                          <span className="animate-pulse text-green-600 dark:text-green-500">▍</span>
                        )}
                      </>
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-600">waiting…</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    validate
                  </p>
                  <div
                    className={[
                      'min-h-9 rounded-lg border px-2.5 py-2 font-mono text-[10px] transition-colors duration-300',
                      step.valid === false
                        ? 'border-red-500/50 bg-red-500/5 text-red-600 dark:text-red-400'
                        : step.valid
                          ? 'border-green-600/50 dark:border-green-500/50 bg-green-600/5 text-green-700 dark:text-green-400'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-600',
                    ].join(' ')}
                  >
                    {step.valid === false
                      ? `✕ ${step.error}`
                      : step.valid
                        ? '✓ matches schema'
                        : '—'}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    tool_result → back to the model
                  </p>
                  <div
                    className={[
                      'min-h-9 rounded-lg border px-2.5 py-2 font-mono text-[10px] break-all transition-colors duration-300',
                      step.highlight === 'execute'
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-neutral-200 dark:border-neutral-800',
                    ].join(' ')}
                  >
                    {step.valid === false ? (
                      <span className="text-red-600 dark:text-red-400">
                        is_error: true · {step.error}
                      </span>
                    ) : step.result ? (
                      <span className="text-neutral-700 dark:text-neutral-200">{step.result}</span>
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-600">—</span>
                    )}
                  </div>
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
