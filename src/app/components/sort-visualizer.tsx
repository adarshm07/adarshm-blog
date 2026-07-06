'use client'

import { useEffect, useRef, useState } from 'react'

type Step = { array: number[]; active: number[]; sorted: number[] }
type Algorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap'

const DEFAULT_ARRAY = [5, 3, 8, 4, 2, 7, 1, 6]

function range(start: number, end: number) {
  const r: number[] = []
  for (let k = start; k <= end; k++) r.push(k)
  return r
}

function bubbleSortSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = [{ array: [...a], active: [], sorted: [] }]
  const sortedFromRight: number[] = []

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({ array: [...a], active: [j, j + 1], sorted: [...sortedFromRight] })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        steps.push({ array: [...a], active: [j, j + 1], sorted: [...sortedFromRight] })
      }
    }
    sortedFromRight.push(n - 1 - i)
  }
  steps.push({ array: [...a], active: [], sorted: range(0, n - 1) })
  return steps
}

function selectionSortSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = [{ array: [...a], active: [], sorted: [] }]

  for (let i = 0; i < n - 1; i++) {
    let min = i
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...a], active: [min, j], sorted: range(0, i - 1) })
      if (a[j] < a[min]) min = j
    }
    if (min !== i) {
      ;[a[i], a[min]] = [a[min], a[i]]
    }
    steps.push({ array: [...a], active: [i, min], sorted: range(0, i) })
  }
  steps.push({ array: [...a], active: [], sorted: range(0, n - 1) })
  return steps
}

function insertionSortSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = [{ array: [...a], active: [], sorted: [0] }]

  for (let i = 1; i < n; i++) {
    let j = i
    while (j > 0 && a[j - 1] > a[j]) {
      steps.push({ array: [...a], active: [j - 1, j], sorted: range(0, i) })
      ;[a[j - 1], a[j]] = [a[j], a[j - 1]]
      steps.push({ array: [...a], active: [j - 1, j], sorted: range(0, i) })
      j--
    }
  }
  steps.push({ array: [...a], active: [], sorted: range(0, n - 1) })
  return steps
}

function mergeSortSteps(input: number[]): Step[] {
  const a = [...input]
  const steps: Step[] = [{ array: [...a], active: [], sorted: [] }]

  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)
    let i = 0
    let j = 0
    let k = lo
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        a[k] = left[i]
        i++
      } else {
        a[k] = right[j]
        j++
      }
      steps.push({ array: [...a], active: range(lo, hi), sorted: [] })
      k++
    }
    while (i < left.length) {
      a[k++] = left[i++]
      steps.push({ array: [...a], active: range(lo, hi), sorted: [] })
    }
    while (j < right.length) {
      a[k++] = right[j++]
      steps.push({ array: [...a], active: range(lo, hi), sorted: [] })
    }
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  sort(0, a.length - 1)
  steps.push({ array: [...a], active: [], sorted: range(0, a.length - 1) })
  return steps
}

function quickSortSteps(input: number[]): Step[] {
  const a = [...input]
  const steps: Step[] = [{ array: [...a], active: [], sorted: [] }]
  const placed: number[] = []

  function partition(lo: number, hi: number) {
    const pivot = a[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      steps.push({ array: [...a], active: [j, hi], sorted: [...placed] })
      if (a[j] < pivot) {
        if (i !== j) {
          ;[a[i], a[j]] = [a[j], a[i]]
          steps.push({ array: [...a], active: [i, j], sorted: [...placed] })
        }
        i++
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    placed.push(i)
    steps.push({ array: [...a], active: [i], sorted: [...placed] })
    return i
  }

  function sort(lo: number, hi: number) {
    if (lo > hi) return
    if (lo === hi) {
      placed.push(lo)
      steps.push({ array: [...a], active: [], sorted: [...placed] })
      return
    }
    const p = partition(lo, hi)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  sort(0, a.length - 1)
  steps.push({ array: [...a], active: [], sorted: range(0, a.length - 1) })
  return steps
}

function heapSortSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = [{ array: [...a], active: [], sorted: [] }]
  const placed: number[] = []

  function siftDown(start: number, size: number) {
    let i = start
    while (true) {
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < size && a[left] > a[largest]) largest = left
      if (right < size && a[right] > a[largest]) largest = right
      if (largest === i) return
      steps.push({ array: [...a], active: [i, largest], sorted: [...placed] })
      ;[a[i], a[largest]] = [a[largest], a[i]]
      steps.push({ array: [...a], active: [i, largest], sorted: [...placed] })
      i = largest
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n)
  for (let end = n - 1; end > 0; end--) {
    steps.push({ array: [...a], active: [0, end], sorted: [...placed] })
    ;[a[0], a[end]] = [a[end], a[0]]
    placed.push(end)
    steps.push({ array: [...a], active: [0], sorted: [...placed] })
    siftDown(0, end)
  }
  steps.push({ array: [...a], active: [], sorted: range(0, n - 1) })
  return steps
}

const stepGenerators: Record<Algorithm, (arr: number[]) => Step[]> = {
  bubble: bubbleSortSteps,
  selection: selectionSortSteps,
  insertion: insertionSortSteps,
  merge: mergeSortSteps,
  quick: quickSortSteps,
  heap: heapSortSteps,
}

function shuffledArray() {
  const a = [...DEFAULT_ARRAY]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function SortVisualizer({ algorithm }: { algorithm: Algorithm }) {
  const [steps, setSteps] = useState<Step[]>(() =>
    stepGenerators[algorithm](DEFAULT_ARRAY)
  )
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const step = steps[index]
  const max = Math.max(...step.array)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, steps.length - 1))
    }, 450)
    return () => clearInterval(id)
  }, [playing, steps])

  useEffect(() => {
    if (index >= steps.length - 1) setPlaying(false)
  }, [index, steps])

  function reset(newSteps?: Step[]) {
    setPlaying(false)
    setIndex(0)
    if (newSteps) setSteps(newSteps)
  }

  return (
    <div className="not-prose my-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
      <div className="flex items-end gap-1.5 h-40">
        {step.array.map((value, i) => {
          const isSorted = step.sorted.includes(i)
          const isActive = step.active.includes(i)
          return (
            <div
              key={i}
              className={[
                'flex-1 rounded-t-sm transition-all duration-200 flex items-start justify-center text-[10px] pt-1',
                isSorted
                  ? 'bg-green-600 dark:bg-green-500 text-white'
                  : isActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
              ].join(' ')}
              style={{ height: `${(value / max) * 100}%` }}
            >
              {value}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          {playing ? 'Pause' : index >= steps.length - 1 ? 'Replay' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => reset(stepGenerators[algorithm](shuffledArray()))}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Shuffle
        </button>
        <span className="ml-auto text-neutral-400 dark:text-neutral-500 tabular-nums">
          {index} / {steps.length - 1}
        </span>
      </div>
    </div>
  )
}
