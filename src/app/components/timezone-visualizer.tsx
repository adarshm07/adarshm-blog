'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Marker = {
  label: string
  at: number // hour offset on the 0–8 local-time axis
  tone: 'wall' | 'instant' | 'gap' | 'repeat'
}

type Step = {
  markers: Marker[]
  caption: string
  note: string
}

const HOURS = ['00', '01', '02', '03', '04', '05']

const steps: Step[] = [
  {
    markers: [{ label: 'meeting 01:30', at: 1.5, tone: 'wall' }],
    caption: 'ordinary day · local wall-clock time',
    note: 'Two different things get called "a date": an instant on the timeline, and a wall-clock reading in some place. Most date bugs are the two being confused.',
  },
  {
    markers: [
      { label: '01:30 = 1761789000', at: 1.5, tone: 'instant' },
    ],
    caption: 'the same moment as an instant',
    note: 'A JavaScript Date is only ever an instant — milliseconds since the epoch. It has no timezone of its own; toString() just renders it in whatever zone the machine happens to be set to.',
  },
  {
    markers: [
      { label: '02:00 → 03:00', at: 2, tone: 'gap' },
    ],
    caption: 'spring forward · 02:00–03:00 never happens',
    note: 'On the spring DST change, local time jumps from 02:00 to 03:00. The hour in between does not exist. A daily 02:30 job simply has no instant to run at on this date.',
  },
  {
    markers: [
      { label: 'stored 02:30', at: 2.5, tone: 'gap' },
      { label: 'resolved 03:30', at: 3.5, tone: 'wall' },
    ],
    caption: 'a wall time in the gap has to be resolved',
    note: 'Ask any library to turn 02:30 into an instant on this date and it must pick a rule: throw, shift forward, or shift back. Temporal makes you choose with a disambiguation option; Date silently guesses.',
  },
  {
    markers: [
      { label: '01:30 (first)', at: 1.5, tone: 'repeat' },
      { label: '01:30 (again)', at: 2.5, tone: 'repeat' },
    ],
    caption: 'fall back · 01:00–02:00 happens twice',
    note: 'In autumn the same hour repeats, so "01:30" names two different instants an hour apart. This is the one that corrupts data: a timestamp stored as local wall time is genuinely ambiguous, and no amount of parsing fixes it.',
  },
  {
    markers: [
      { label: 'stored as UTC instant', at: 1.5, tone: 'instant' },
    ],
    caption: 'store the instant, render the wall time',
    note: 'The fix is a rule, not a library: store instants (UTC, or epoch milliseconds), keep the user’s IANA zone alongside when the wall time matters, and convert only at the edges — when rendering, and when parsing user input.',
  },
  {
    markers: [
      { label: 'ZonedDateTime', at: 1.5, tone: 'instant' },
      { label: 'PlainDate — no zone', at: 3.5, tone: 'wall' },
    ],
    caption: 'Temporal separates the two ideas',
    note: 'Temporal splits them by type: Instant is a point in time, PlainDate and PlainDateTime carry no zone at all, and ZonedDateTime is an instant plus an IANA zone. A birthday is a PlainDate; a meeting is a ZonedDateTime. Picking the type is the design decision.',
  },
]

const TONE: Record<Marker['tone'], string> = {
  wall: 'bg-neutral-700 dark:bg-neutral-300 text-white dark:text-neutral-900',
  instant: 'bg-green-600 dark:bg-green-500 text-white',
  gap: 'bg-red-500 text-white',
  repeat: 'bg-amber-500 text-white',
}

export function TimezoneVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2400}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              {step.caption}
            </p>

            <div className="relative h-24">
              {/* the hour axis */}
              <div className="absolute inset-x-0 top-10 flex">
                {HOURS.map((h) => (
                  <div key={h} className="flex-1 pr-0.5">
                    <div className="h-1 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    <span className="mt-1 block font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                      {h}:00
                    </span>
                  </div>
                ))}
              </div>

              {step.markers.map((marker) => (
                <div
                  key={marker.label}
                  className="absolute top-0 -translate-x-1/2 transition-all duration-700"
                  style={{ left: `${(marker.at / HOURS.length) * 100}%` }}
                >
                  <span
                    className={[
                      'whitespace-nowrap rounded-md px-1.5 py-1 font-mono text-[10px]',
                      TONE[marker.tone],
                    ].join(' ')}
                  >
                    {marker.label}
                  </span>
                  <div className="mx-auto h-6 w-px bg-neutral-300 dark:bg-neutral-600" />
                </div>
              ))}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
