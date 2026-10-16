'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// ── Geohash ────────────────────────────────────────────────────────────────

const B32 = '0123456789bcdefghjkmnpqrstuvwxyz'
const POINT = { lat: 12.9716, lon: 77.5946 } // Bengaluru

type Range = [number, number]
type GeoStep = { bit: 0 | 1; axis: 'lon' | 'lat'; lon: Range; lat: Range }

// Each bit halves the current cell, alternating longitude and latitude.
// Traced with the encoder in the post: 12.9716, 77.5946 → "tdr1v9".
const geoSteps: GeoStep[] = [
  { axis: 'lon', bit: 1, lon: [0, 180], lat: [-90, 90] },
  { axis: 'lat', bit: 1, lon: [0, 180], lat: [0, 90] },
  { axis: 'lon', bit: 0, lon: [0, 90], lat: [0, 90] },
  { axis: 'lat', bit: 0, lon: [0, 90], lat: [0, 45] },
  { axis: 'lon', bit: 1, lon: [45, 90], lat: [0, 45] },
  { axis: 'lat', bit: 0, lon: [45, 90], lat: [0, 22.5] },
  { axis: 'lon', bit: 1, lon: [67.5, 90], lat: [0, 22.5] },
  { axis: 'lat', bit: 1, lon: [67.5, 90], lat: [11.25, 22.5] },
  { axis: 'lon', bit: 0, lon: [67.5, 78.75], lat: [11.25, 22.5] },
  { axis: 'lat', bit: 0, lon: [67.5, 78.75], lat: [11.25, 16.875] },
]

const W = 320
const H = 160
const xOf = (lon: number) => ((lon + 180) / 360) * W
const yOf = (lat: number) => ((90 - lat) / 180) * H

const geoNotes = [
  'Start with the whole world. Bit 1 splits longitude at 0°: Bengaluru (77.59° E) is in the east half, so the bit is 1.',
  'Bit 2 splits latitude at 0°: 12.97° N is in the north half → 1. The cell is now a quarter of the world.',
  'Bit 3 splits the cell\'s longitude at 90°: 77.59 is below it → 0.',
  'Bit 4 splits latitude at 45° → 0. Each bit halves the cell, alternating between the two axes.',
  'Bit 5 → 1. Five bits make one base-32 character: 11001 = 25 → "t". Every place on Earth whose geohash starts with "t" is inside this cell.',
  'Bit 6 splits latitude at 22.5° → 0.',
  'Bit 7 splits longitude at 67.5° → 1.',
  'Bit 8 splits latitude at 11.25° → 1.',
  'Bit 9 → 0.',
  'Bit 10 → 0. The next five bits, 01100 = 12, give "d": the cell "td" is about 11° × 5.6°. Keep going to 30 bits and you get "tdr1v9" — a cell about 1.2 km × 0.6 km.',
]

export function GeohashVisualizer() {
  return (
    <StepPlayer length={geoSteps.length} interval={2200}>
      {(index) => {
        const step = geoSteps[index]
        const bits = geoSteps.slice(0, index + 1).map((s) => s.bit)
        const chars = []
        for (let i = 0; i + 5 <= bits.length; i += 5) chars.push(B32[parseInt(bits.slice(i, i + 5).join(''), 2)])
        const prev = index > 0 ? geoSteps[index - 1] : { lon: [-180, 180] as Range, lat: [-90, 90] as Range }
        const split =
          step.axis === 'lon'
            ? { x1: xOf((prev.lon[0] + prev.lon[1]) / 2), x2: xOf((prev.lon[0] + prev.lon[1]) / 2), y1: yOf(prev.lat[1]), y2: yOf(prev.lat[0]) }
            : { x1: xOf(prev.lon[0]), x2: xOf(prev.lon[1]), y1: yOf((prev.lat[0] + prev.lat[1]) / 2), y2: yOf((prev.lat[0] + prev.lat[1]) / 2) }
        return (
          <>
            {(() => {
              // Zoom to the cell being split, with a margin, so every halving stays visible.
              const x0 = xOf(prev.lon[0])
              const x1 = xOf(prev.lon[1])
              const y0 = yOf(prev.lat[1])
              const y1 = yOf(prev.lat[0])
              const pad = Math.max(x1 - x0, y1 - y0) * 0.12
              const vb = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad }
              return (
                <svg
                  viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
                  className="mx-auto block h-44 w-full max-w-sm"
                  role="img"
                  aria-label="Geohash cell, zoomed to the current split"
                >
                  <rect x={0} y={0} width={W} height={H} vectorEffect="non-scaling-stroke" className="fill-neutral-50 dark:fill-neutral-900 stroke-neutral-200 dark:stroke-neutral-700" />
                  <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} vectorEffect="non-scaling-stroke" className="fill-amber-500/10 stroke-amber-500/50" />
                  <rect
                    x={xOf(step.lon[0])}
                    y={yOf(step.lat[1])}
                    width={xOf(step.lon[1]) - xOf(step.lon[0])}
                    height={yOf(step.lat[0]) - yOf(step.lat[1])}
                    vectorEffect="non-scaling-stroke"
                    className="fill-green-600/25 stroke-green-600 dark:stroke-green-500"
                  />
                  <line {...split} strokeWidth={1.5} vectorEffect="non-scaling-stroke" className="stroke-amber-500" />
                  <circle cx={xOf(POINT.lon)} cy={yOf(POINT.lat)} r={vb.w / 70} className="fill-red-500" />
                </svg>
              )
            })()}
            <div className="mt-1 text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              cell: lon {step.lon[0]}° … {step.lon[1]}°, lat {step.lat[0]}° … {step.lat[1]}° · red dot = Bengaluru
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px]">
              <span className="text-neutral-500 dark:text-neutral-400">
                bits{' '}
                {bits.map((b, i) => (
                  <span
                    key={i}
                    className={[
                      i === index ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-800 dark:text-neutral-100',
                      i % 5 === 4 ? 'mr-1.5' : '',
                    ].join(' ')}
                  >
                    {b}
                  </span>
                ))}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                geohash <span className="text-green-700 dark:text-green-400">{chars.join('') || '—'}</span>
              </span>
            </div>
            <StepNote>{geoNotes[index]}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
