'use client'

import { useState } from 'react'

type Inputs = {
  dau: number
  actionsPerUser: number
  peakMultiplier: number
  readWriteRatio: number
  payloadKb: number
  retentionDays: number
  replicas: number
}

const DEFAULTS: Inputs = {
  dau: 1_000_000,
  actionsPerUser: 20,
  peakMultiplier: 3,
  readWriteRatio: 100,
  payloadKb: 2,
  retentionDays: 365,
  replicas: 3,
}

const FIELDS: { key: keyof Inputs; label: string; hint: string; step?: number }[] = [
  { key: 'dau', label: 'Daily active users', hint: 'people using it on a given day' },
  { key: 'actionsPerUser', label: 'Writes per user per day', hint: 'posts, messages, orders…' },
  { key: 'peakMultiplier', label: 'Peak multiplier', hint: 'peak QPS ÷ average QPS', step: 0.5 },
  { key: 'readWriteRatio', label: 'Reads per write', hint: 'most consumer apps: 50–200' },
  { key: 'payloadKb', label: 'Bytes per record (KB)', hint: 'stored size, not wire size', step: 0.5 },
  { key: 'retentionDays', label: 'Retention (days)', hint: 'how long you keep it' },
  { key: 'replicas', label: 'Replication factor', hint: 'copies of every byte' },
]

function human(n: number, unit = '') {
  if (!isFinite(n)) return '—'
  const units = ['', 'K', 'M', 'B', 'T']
  let value = n
  let i = 0
  while (Math.abs(value) >= 1000 && i < units.length - 1) {
    value /= 1000
    i++
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)}${units[i]}${unit}`
}

function bytes(n: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let value = n
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`
}

// "Numbers every programmer should know", rounded to what is useful in an interview.
const LATENCIES: [string, string][] = [
  ['L1 cache reference', '~1 ns'],
  ['Main memory reference', '~100 ns'],
  ['Compress 1KB', '~2 µs'],
  ['SSD random read', '~100 µs'],
  ['Read 1MB sequentially from memory', '~100 µs'],
  ['Round trip within a datacenter', '~500 µs'],
  ['Read 1MB sequentially from SSD', '~1 ms'],
  ['Disk seek (spinning)', '~10 ms'],
  ['Round trip CA → Netherlands', '~150 ms'],
]

export function CapacityCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)

  const writesPerDay = inputs.dau * inputs.actionsPerUser
  const writeQps = writesPerDay / 86_400
  const readQps = writeQps * inputs.readWriteRatio
  const peakWrite = writeQps * inputs.peakMultiplier
  const peakRead = readQps * inputs.peakMultiplier

  const bytesPerDay = writesPerDay * inputs.payloadKb * 1024
  const totalStorage = bytesPerDay * inputs.retentionDays * inputs.replicas
  const writeBandwidth = (writeQps * inputs.payloadKb * 1024 * 8) / 1_000_000 // Mbps
  const readBandwidth = (readQps * inputs.payloadKb * 1024 * 8) / 1_000_000
  const hotSet = totalStorage / inputs.replicas * 0.2 // 80/20 rule, single copy

  const results: { label: string; value: string; note?: string }[] = [
    { label: 'Writes/sec (avg)', value: human(writeQps) },
    { label: 'Writes/sec (peak)', value: human(peakWrite), note: `${inputs.peakMultiplier}× average` },
    { label: 'Reads/sec (avg)', value: human(readQps) },
    { label: 'Reads/sec (peak)', value: human(peakRead) },
    { label: 'New data per day', value: bytes(bytesPerDay) },
    { label: 'Total stored', value: bytes(totalStorage), note: `${inputs.retentionDays}d × ${inputs.replicas} copies` },
    { label: 'Write bandwidth', value: `${writeBandwidth.toFixed(1)} Mbps` },
    { label: 'Read bandwidth', value: `${readBandwidth.toFixed(1)} Mbps` },
    { label: 'Cache for hot 20%', value: bytes(hotSet), note: 'single copy' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="text-xs text-neutral-600 dark:text-neutral-300">{field.label}</span>
            <input
              type="number"
              min={0}
              step={field.step ?? 1}
              value={inputs[field.key]}
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, [field.key]: Number(e.target.value) || 0 }))
              }
              className="mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 font-mono text-sm text-neutral-900 dark:text-neutral-50 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
            />
            <span className="mt-0.5 block text-[10px] text-neutral-400 dark:text-neutral-500">
              {field.hint}
            </span>
          </label>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Estimates
          </h2>
          <button
            type="button"
            onClick={() => setInputs(DEFAULTS)}
            className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {results.map((result) => (
            <div
              key={result.label}
              className="rounded-xl border border-neutral-100 dark:border-neutral-800 px-3 py-2.5"
            >
              <p className="font-mono text-base tabular-nums text-neutral-900 dark:text-neutral-50">
                {result.value}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                {result.label}
              </p>
              {result.note && (
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{result.note}</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          These are order-of-magnitude numbers, which is all they need to be. The
          point of the exercise is to find the component that breaks first: at{' '}
          {human(peakRead)} reads/sec you are past what one relational primary
          serves, and at {bytes(totalStorage)} you are past one machine.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Latency numbers worth memorising
        </h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {LATENCIES.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between py-1.5">
              <span className="text-xs text-neutral-600 dark:text-neutral-300">{label}</span>
              <span className="font-mono text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
