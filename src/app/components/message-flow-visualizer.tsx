'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Row = {
  dir: 'c2s' | 's2c'
  label: string
  wasted?: boolean
  held?: boolean
}

type Step = { rows: Row[]; note: string }

type Scenario = 'short-polling' | 'long-polling' | 'sse' | 'websocket'

const shortPolling: Step[] = [
  {
    rows: [],
    note: 'Short polling: the client asks "anything new?" on a fixed interval.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '204 No Content', wasted: true },
    ],
    note: 'Nothing new yet — a full HTTP round trip (headers, connection work) for an empty answer.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '204 No Content', wasted: true },
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '204 No Content', wasted: true },
    ],
    note: 'Still nothing. Most polls are wasted work — and this scales with every connected client.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '204 No Content', wasted: true },
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '204 No Content', wasted: true },
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '200 { new message }' },
    ],
    note: 'Data finally arrives — but it had been sitting on the server for up to one full poll interval. Shorter intervals reduce latency but multiply wasted requests.',
  },
]

const longPolling: Step[] = [
  {
    rows: [],
    note: 'Long polling: the client asks once, and the server holds the request open until it has something to say.',
  },
  {
    rows: [{ dir: 'c2s', label: 'GET /updates' }],
    note: 'The request arrives, but the server does not respond yet — it just holds the connection.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '… holding …', held: true },
    ],
    note: 'Seconds pass. No wasted round trips — the connection simply waits.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '… holding …', held: true },
      { dir: 's2c', label: '200 { new message }' },
    ],
    note: 'The moment data exists, the held request completes — near-instant delivery.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /updates' },
      { dir: 's2c', label: '… holding …', held: true },
      { dir: 's2c', label: '200 { new message }' },
      { dir: 'c2s', label: 'GET /updates (immediately re-poll)' },
    ],
    note: 'The client immediately re-polls to keep a request parked at the server. Downside: one held connection per client, plus re-poll churn.',
  },
]

const sse: Step[] = [
  {
    rows: [],
    note: 'Server-Sent Events: one long-lived HTTP response that the server keeps appending to.',
  },
  {
    rows: [{ dir: 'c2s', label: 'GET /stream (Accept: text/event-stream)' }],
    note: 'The client connects once with the EventSource API.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /stream (Accept: text/event-stream)' },
      { dir: 's2c', label: 'data: { price: 101 }' },
      { dir: 's2c', label: 'data: { price: 102 }' },
    ],
    note: 'The server pushes events down the open response whenever it likes — no new requests, no re-polling.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /stream (Accept: text/event-stream)' },
      { dir: 's2c', label: 'data: { price: 101 }' },
      { dir: 's2c', label: 'data: { price: 102 }' },
      { dir: 's2c', label: 'data: { price: 103 }' },
    ],
    note: 'Strictly one-way: server → client only. The browser even auto-reconnects for free. To send data up, the client makes ordinary HTTP requests.',
  },
]

const websocket: Step[] = [
  {
    rows: [],
    note: 'WebSocket: one TCP connection upgraded out of HTTP into a two-way message channel.',
  },
  {
    rows: [{ dir: 'c2s', label: 'GET /feed (Upgrade: websocket)' }],
    note: 'The connection starts life as a normal HTTP request with an Upgrade header.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /feed (Upgrade: websocket)' },
      { dir: 's2c', label: '101 Switching Protocols' },
    ],
    note: 'The server agrees, and HTTP steps aside — the raw connection now carries lightweight frames in both directions.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /feed (Upgrade: websocket)' },
      { dir: 's2c', label: '101 Switching Protocols' },
      { dir: 'c2s', label: '{ subscribe: "AAPL" }' },
      { dir: 's2c', label: '{ AAPL: 227.4 }' },
      { dir: 's2c', label: '{ AAPL: 227.6 }' },
    ],
    note: 'Either side can send at any time with a few bytes of framing overhead — ideal for chat, games, and live market data.',
  },
  {
    rows: [
      { dir: 'c2s', label: 'GET /feed (Upgrade: websocket)' },
      { dir: 's2c', label: '101 Switching Protocols' },
      { dir: 'c2s', label: '{ subscribe: "AAPL" }' },
      { dir: 's2c', label: '{ AAPL: 227.4 }' },
      { dir: 's2c', label: '{ AAPL: 227.6 }' },
      { dir: 'c2s', label: '{ subscribe: "TSLA" }' },
      { dir: 's2c', label: '{ TSLA: 412.1 }' },
    ],
    note: 'Full duplex in action. The cost: you now own reconnection, heartbeats, and message ordering — the things HTTP gave you for free.',
  },
]

const scenarios: Record<Scenario, Step[]> = {
  'short-polling': shortPolling,
  'long-polling': longPolling,
  sse,
  websocket,
}

export function MessageFlowVisualizer({ scenario }: { scenario: Scenario }) {
  const steps = scenarios[scenario]
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex justify-between text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-2">
              <span>Client</span>
              <span>Server</span>
            </div>
            <div className="flex flex-col gap-1.5 min-h-36">
              {step.rows.map((row, i) => (
                <div
                  key={i}
                  className={[
                    'flex items-center gap-2 font-mono text-[11px] leading-tight',
                    row.dir === 'c2s' ? 'justify-start' : 'justify-end',
                    row.wasted || row.held ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  {row.dir === 's2c' && (
                    <span className="text-green-600 dark:text-green-500">←</span>
                  )}
                  <span
                    className={[
                      'rounded px-2 py-1',
                      row.dir === 'c2s'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
                    ].join(' ')}
                  >
                    {row.label}
                    {row.wasted ? ' · wasted' : ''}
                  </span>
                  {row.dir === 'c2s' && (
                    <span className="text-neutral-400 dark:text-neutral-500">→</span>
                  )}
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
