export function PromiseStateDiagram() {
  return (
    <div className="not-prose my-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
      <svg
        viewBox="0 0 480 200"
        className="mx-auto block w-full max-w-md"
        role="img"
        aria-label="Promise state diagram: pending transitions to fulfilled via resolve or to rejected via reject; both settled states are final"
      >
        <rect
          x="20"
          y="75"
          width="120"
          height="50"
          rx="10"
          className="fill-neutral-100 dark:fill-neutral-800"
        />
        <text
          x="80"
          y="104"
          textAnchor="middle"
          className="fill-neutral-700 dark:fill-neutral-300 font-mono text-[13px]"
        >
          pending
        </text>

        <line
          x1="140"
          y1="88"
          x2="330"
          y2="42"
          className="stroke-neutral-300 dark:stroke-neutral-600"
          strokeWidth="1.5"
        />
        <text
          x="235"
          y="52"
          textAnchor="middle"
          className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[11px]"
        >
          resolve(value)
        </text>

        <line
          x1="140"
          y1="112"
          x2="330"
          y2="158"
          className="stroke-neutral-300 dark:stroke-neutral-600"
          strokeWidth="1.5"
        />
        <text
          x="235"
          y="158"
          textAnchor="middle"
          className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[11px]"
        >
          reject(reason)
        </text>

        <rect
          x="330"
          y="15"
          width="130"
          height="50"
          rx="10"
          className="fill-green-600 dark:fill-green-500"
        />
        <text
          x="395"
          y="44"
          textAnchor="middle"
          className="fill-white font-mono text-[13px]"
        >
          fulfilled
        </text>

        <rect
          x="330"
          y="135"
          width="130"
          height="50"
          rx="10"
          className="fill-red-500"
        />
        <text
          x="395"
          y="164"
          textAnchor="middle"
          className="fill-white font-mono text-[13px]"
        >
          rejected
        </text>
      </svg>
      <p className="mt-3 text-xs text-center text-neutral-500 dark:text-neutral-400">
        A promise settles exactly once — fulfilled or rejected — and never
        changes state again. Extra resolve/reject calls are silently ignored.
      </p>
    </div>
  )
}

export function ScopeChainDiagram() {
  return (
    <div className="not-prose my-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
      <svg
        viewBox="0 0 480 250"
        className="mx-auto block w-full max-w-md"
        role="img"
        aria-label="Scope chain diagram: increment's scope is nested inside makeCounter's scope, which is nested inside the global scope; a variable lookup for count walks outward until it finds it in makeCounter's scope"
      >
        <rect
          x="10"
          y="10"
          width="460"
          height="230"
          rx="12"
          className="fill-none stroke-neutral-200 dark:stroke-neutral-700"
          strokeWidth="1.5"
        />
        <text
          x="26"
          y="34"
          className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[11px]"
        >
          global scope
        </text>

        <rect
          x="40"
          y="50"
          width="400"
          height="170"
          rx="12"
          className="fill-none stroke-neutral-300 dark:stroke-neutral-600"
          strokeWidth="1.5"
        />
        <text
          x="56"
          y="74"
          className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[11px]"
        >
          makeCounter() scope
        </text>
        <rect
          x="56"
          y="86"
          width="130"
          height="28"
          rx="6"
          className="fill-green-600 dark:fill-green-500"
        />
        <text
          x="121"
          y="104"
          textAnchor="middle"
          className="fill-white font-mono text-[11px]"
        >
          let count = 0
        </text>

        <rect
          x="70"
          y="130"
          width="340"
          height="70"
          rx="12"
          className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-600"
          strokeWidth="1.5"
        />
        <text
          x="86"
          y="154"
          className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[11px]"
        >
          increment() scope
        </text>
        <text
          x="86"
          y="180"
          className="fill-neutral-700 dark:fill-neutral-300 font-mono text-[11px]"
        >
          count++ … where is count?
        </text>

        <path
          d="M 300 168 C 340 150, 300 105, 196 100"
          fill="none"
          className="stroke-amber-500"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <text
          x="330"
          y="128"
          className="fill-amber-500 font-mono text-[11px]"
        >
          found one scope up
        </text>
      </svg>
      <p className="mt-3 text-xs text-center text-neutral-500 dark:text-neutral-400">
        A variable lookup walks outward through the scope chain. The closure is
        increment() keeping makeCounter&apos;s scope alive after it returned.
      </p>
    </div>
  )
}
