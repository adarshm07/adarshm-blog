import Link from 'next/link'
import type { ReactNode } from 'react'
import { getBlogPosts, getReadingTime } from '@/app/blog/utils'
import { baseUrl } from '@/app/sitemap'
import { ReadingProgress } from '@/app/components/reading-progress'
import { TableOfContents } from '@/app/components/toc'
import { EnginePipelineVisualizer } from '@/app/components/engine-pipeline-visualizer'
import { CallStackVisualizer } from '@/app/components/call-stack-visualizer'
import { HoistingVisualizer } from '@/app/components/hoisting-visualizer'
import { PromiseStateDiagram, ScopeChainDiagram } from '@/app/components/diagrams'
import { ThisBindingVisualizer } from '@/app/components/this-binding-visualizer'
import { CopyDepthVisualizer } from '@/app/components/copy-depth-visualizer'
import { PrototypeChainVisualizer } from '@/app/components/prototype-chain-visualizer'
import { StructuralSharingVisualizer } from '@/app/components/structural-sharing-visualizer'
import { EventLoopVisualizer } from '@/app/components/event-loop-visualizer'
import { GeneratorVisualizer } from '@/app/components/generator-visualizer'
import { CancellationVisualizer } from '@/app/components/cancellation-visualizer'
import { RenderPipelineVisualizer } from '@/app/components/render-pipeline-visualizer'
import { SignalTimeline } from '@/app/components/signal-timeline'
import { WorkerThreadVisualizer } from '@/app/components/worker-thread-visualizer'
import { ReconciliationVisualizer } from '@/app/components/reconciliation-visualizer'
import { BackpressureVisualizer } from '@/app/components/backpressure-visualizer'

const TITLE = 'How JavaScript Works'
const DESCRIPTION =
  'One page, start to finish: how the engine runs your code, how objects and scope behave, how async works, and what the browser does with it all — every idea with an animation you can step through.'

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/learn' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${baseUrl}/learn`,
    images: [{ url: `/og?title=${encodeURIComponent(TITLE)}` }],
  },
}

function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 font-mono text-[0.85em] text-neutral-800 dark:text-neutral-200">
      {children}
    </code>
  )
}

type Chapter = {
  id: string
  title: string
  body: ReactNode
  demo: ReactNode
  keyIdea: string
  post?: string // blog slug for the full article
}

type Part = { id: string; title: string; blurb: string; chapters: Chapter[] }

const PARTS: Part[] = [
  {
    id: 'running-code',
    title: 'How your code runs',
    blurb: 'What happens between saving a file and seeing it run.',
    chapters: [
      {
        id: 'the-engine',
        title: 'The engine: from text to machine code',
        body: (
          <>
            A browser or Node doesn&apos;t run your file as-is. A JavaScript
            engine reads it, turns it into a tree, runs it quickly in an
            interpreter, and then compiles the parts that run a lot into fast
            machine code — making bets about your types as it goes.
          </>
        ),
        demo: <EnginePipelineVisualizer />,
        keyIdea:
          'Code starts slow and gets faster the more it runs. Keeping the types that flow through a function consistent keeps it fast.',
      },
      {
        id: 'call-stack',
        title: 'The call stack',
        body: (
          <>
            JavaScript runs one thing at a time. It tracks where it is with a
            stack: calling a function pushes a frame on top, returning pops it
            off. Whatever is on top is what&apos;s running right now. Too many
            frames and you get the famous <C>Maximum call stack size exceeded</C>.
          </>
        ),
        demo: <CallStackVisualizer />,
        keyIdea: 'One stack, one thing at a time. Everything else in this page builds on that.',
        post: 'recursion-and-the-call-stack',
      },
      {
        id: 'hoisting',
        title: 'Hoisting and the temporal dead zone',
        body: (
          <>
            Before any line in a scope runs, the engine creates every variable
            and function that scope declares. <C>var</C> starts as{' '}
            <C>undefined</C>, functions start ready to call, and <C>let</C> /{' '}
            <C>const</C> exist but can&apos;t be touched until their line runs.
          </>
        ),
        demo: <HoistingVisualizer />,
        keyIdea: 'Nothing moves. Declarations are set up before execution — in different states.',
        post: 'hoisting-and-the-temporal-dead-zone',
      },
      {
        id: 'scope-and-closures',
        title: 'Scope and closures',
        body: (
          <>
            Every function can see the variables where it was <em>written</em>,
            not where it&apos;s called. When a function outlives the function
            that created it, it keeps those variables alive — that&apos;s a
            closure, and it&apos;s how JavaScript does private state.
          </>
        ),
        demo: <ScopeChainDiagram />,
        keyIdea: 'A function carries its birthplace with it.',
        post: 'closures-and-the-module-pattern',
      },
      {
        id: 'this',
        title: 'The this keyword',
        body: (
          <>
            Unlike scope, <C>this</C> is decided by <em>how a function is
            called</em>, every single time. Four rules cover almost everything,
            and arrow functions opt out of all of them.
          </>
        ),
        demo: <ThisBindingVisualizer />,
        keyIdea: 'Look at the call site, not the definition: what is to the left of the dot?',
        post: 'javascript-this-keyword',
      },
    ],
  },
  {
    id: 'values-and-objects',
    title: 'Values and objects',
    blurb: 'What a variable actually holds, and how objects share behaviour.',
    chapters: [
      {
        id: 'references',
        title: 'Values, references, and copying',
        body: (
          <>
            Numbers and strings are stored directly. Objects and arrays
            aren&apos;t — a variable holds a <em>reference</em> to them.
            Spread (<C>{'{ ...obj }'}</C>) copies only the top level, so nested
            objects stay shared between the copy and the original.
          </>
        ),
        demo: <CopyDepthVisualizer />,
        keyIdea: 'Copying an object copies references one level deep. structuredClone copies all the way down.',
        post: 'shallow-vs-deep-copy',
      },
      {
        id: 'prototypes',
        title: 'Prototypes',
        body: (
          <>
            JavaScript objects don&apos;t copy methods from a class. Each object
            has a hidden link to another object, its prototype. When a property
            isn&apos;t found, the engine follows that link, and the next, until
            it finds it or reaches <C>null</C>. <C>class</C> is a nicer way to
            set up the same chain.
          </>
        ),
        demo: <PrototypeChainVisualizer />,
        keyIdea: 'Missing property? Walk up the chain. That walk is inheritance.',
        post: 'javascript-prototypes-explained',
      },
      {
        id: 'immutability',
        title: 'Immutability and structural sharing',
        body: (
          <>
            Instead of changing an object, make a new one — but only copy the
            path that changed and reuse everything else. It&apos;s cheap, and it
            lets React and friends tell what changed with a simple{' '}
            <C>===</C>.
          </>
        ),
        demo: <StructuralSharingVisualizer />,
        keyIdea: 'New object on the changed path, shared objects everywhere else.',
        post: 'immutability-and-structural-sharing',
      },
    ],
  },
  {
    id: 'async',
    title: 'Asynchronous JavaScript',
    blurb: 'How a single-threaded language waits for timers, networks, and users.',
    chapters: [
      {
        id: 'event-loop',
        title: 'The event loop',
        body: (
          <>
            Timers, network requests and clicks are handled outside JavaScript.
            When they finish, their callbacks wait in a queue. The event loop
            moves the next one onto the call stack — but only when the stack is
            empty, and promise callbacks (microtasks) always go before timers
            (tasks).
          </>
        ),
        demo: <EventLoopVisualizer scenario="timeout-vs-promise" />,
        keyIdea: 'Stack empty → run every microtask → run one task → repeat.',
        post: 'javascript-event-loop',
      },
      {
        id: 'promises',
        title: 'Promises',
        body: (
          <>
            A promise is a placeholder for a value that isn&apos;t ready yet. It
            starts <em>pending</em> and settles exactly once — fulfilled with a
            value or rejected with an error. <C>.then</C> and <C>.catch</C>{' '}
            register what should happen next.
          </>
        ),
        demo: <PromiseStateDiagram />,
        keyIdea: 'Pending, then settled once and forever.',
        post: 'javascript-promises-in-depth',
      },
      {
        id: 'async-await',
        title: 'async / await',
        body: (
          <>
            <C>await</C> doesn&apos;t block anything. It pauses just this
            function, hands control back to the event loop, and resumes it as a
            microtask when the promise settles. The code reads top to bottom but
            runs in pieces.
          </>
        ),
        demo: <EventLoopVisualizer scenario="async-await" />,
        keyIdea: 'await = "finish the rest of me later". Everything after it is a callback.',
        post: 'async-await-under-the-hood',
      },
      {
        id: 'generators',
        title: 'Generators',
        body: (
          <>
            A generator is a function that can pause in the middle with{' '}
            <C>yield</C> and pick up later exactly where it stopped, local
            variables intact. It&apos;s the machinery async functions are built
            on.
          </>
        ),
        demo: <GeneratorVisualizer />,
        keyIdea: 'A function you can pause, and resume on demand.',
        post: 'javascript-generators-and-iterators',
      },
      {
        id: 'cancellation',
        title: 'Cancellation with AbortController',
        body: (
          <>
            Promises can&apos;t be cancelled on their own. An{' '}
            <C>AbortController</C> gives you a signal you pass into{' '}
            <C>fetch</C>, listeners and your own code, so one call to{' '}
            <C>abort()</C> stops all of it.
          </>
        ),
        demo: <CancellationVisualizer />,
        keyIdea: 'Pass the signal everywhere; abort once to clean up everything.',
        post: 'abortcontroller-and-cancellation',
      },
    ],
  },
  {
    id: 'browser',
    title: 'The browser',
    blurb: 'Turning code into pixels, and keeping the page responsive.',
    chapters: [
      {
        id: 'rendering',
        title: 'From DOM to pixels',
        body: (
          <>
            After JavaScript changes the page, the browser recalculates styles,
            works out where every box goes (layout), paints them, and
            composites the layers. Changing size or position redoes layout;
            changing <C>transform</C> or <C>opacity</C> can skip straight to
            compositing.
          </>
        ),
        demo: <RenderPipelineVisualizer />,
        keyIdea: 'Style → layout → paint → composite. The earlier a change starts, the more it costs.',
        post: 'rendering-pipeline-reflow-repaint',
      },
      {
        id: 'debounce-throttle',
        title: 'Debounce and throttle',
        body: (
          <>
            Scrolling, typing and resizing fire dozens of events a second.
            Debounce waits until they stop; throttle lets one through at a fixed
            rate. Both keep expensive work from running on every event.
          </>
        ),
        demo: <SignalTimeline />,
        keyIdea: 'Debounce: after the storm. Throttle: at a steady pace during it.',
        post: 'debounce-vs-throttle',
      },
      {
        id: 'web-workers',
        title: 'Web Workers',
        body: (
          <>
            The main thread runs your JavaScript <em>and</em> draws the page, so
            a long calculation freezes everything. A Web Worker runs code on a
            separate thread and talks to the page by passing messages.
          </>
        ),
        demo: <WorkerThreadVisualizer />,
        keyIdea: 'Heavy work off the main thread, results back by message.',
        post: 'web-workers-off-the-main-thread',
      },
      {
        id: 'react',
        title: 'How React updates the page',
        body: (
          <>
            React re-runs your components, compares the new result with the
            last one, and applies only the differences to the DOM. In lists it
            matches items by <C>key</C> — so the key decides which item keeps
            which state.
          </>
        ),
        demo: <ReconciliationVisualizer />,
        keyIdea: 'Same key = same component instance. Use ids from your data, not array indexes.',
        post: 'react-reconciliation-and-keys',
      },
    ],
  },
  {
    id: 'server',
    title: 'Beyond the browser',
    blurb: 'The same engine on a server, moving more data than fits in memory.',
    chapters: [
      {
        id: 'streams',
        title: 'Streams and backpressure',
        body: (
          <>
            Node reads big files and network data in chunks instead of all at
            once. When the reader is faster than the writer, backpressure tells
            it to pause, so memory stays flat no matter how large the data is.
          </>
        ),
        demo: <BackpressureVisualizer />,
        keyIdea: 'Process data in chunks, and let the slowest step set the pace.',
        post: 'streams-and-backpressure',
      },
    ],
  },
]

// Chapters are numbered straight through, across parts.
const CHAPTER_NUMBER = new Map(
  PARTS.flatMap((part) => part.chapters).map((chapter, i) => [chapter.id, i + 1])
)

export default function Page() {
  const posts = new Map(getBlogPosts().map((p) => [p.slug, p]))

  for (const part of PARTS) {
    for (const chapter of part.chapters) {
      if (chapter.post && !posts.has(chapter.post)) {
        throw new Error(`/learn references missing post: ${chapter.post}`)
      }
    }
  }

  const total = CHAPTER_NUMBER.size

  return (
    <section>
      <ReadingProgress />
      <TableOfContents />

      <div className="mb-10 border-b border-neutral-100 dark:border-neutral-800 pb-8">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {TITLE}
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Everything you need to understand what JavaScript is really doing, on
          one page and in order — {total} short chapters, each with an animation.
          No prior knowledge beyond writing a little JavaScript is assumed.
        </p>
        <p className="mt-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
          Press <strong className="font-medium text-neutral-700 dark:text-neutral-200">Play</strong>{' '}
          on any animation, or use <strong className="font-medium text-neutral-700 dark:text-neutral-200">Next</strong>{' '}
          and <strong className="font-medium text-neutral-700 dark:text-neutral-200">Back</strong>{' '}
          to go at your own pace. Every chapter links to a full article if you
          want to go deeper.
        </p>

        <ol className="mt-6 grid gap-2 sm:grid-cols-2">
          {PARTS.map((part, i) => (
            <li key={part.id}>
              <a
                href={`#${part.id}`}
                className="group block h-full rounded-xl border border-neutral-100 dark:border-neutral-800 p-3 transition-colors hover:border-green-600/40 dark:hover:border-green-500/40"
              >
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                  Part {i + 1} · {part.chapters.length}{' '}
                  {part.chapters.length === 1 ? 'chapter' : 'chapters'}
                </span>
                <span className="mt-0.5 block text-sm font-medium text-neutral-900 dark:text-neutral-50 transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
                  {part.title}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  {part.blurb}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <article>
        {PARTS.map((part, partIndex) => (
          <div key={part.id} className="mb-14">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-green-600 dark:text-green-500">
              Part {partIndex + 1}
            </p>
            <h2
              id={part.id}
              className="mb-2 scroll-mt-24 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              {part.title}
            </h2>
            <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">{part.blurb}</p>

            <div className="space-y-12">
              {part.chapters.map((chapter) => {
                const post = chapter.post ? posts.get(chapter.post) : undefined
                return (
                  <div key={chapter.id}>
                    <h3
                      id={chapter.id}
                      className="mb-2 flex scroll-mt-24 items-baseline gap-2 text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-50"
                    >
                      <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
                        {String(CHAPTER_NUMBER.get(chapter.id)).padStart(2, '0')}{' '}
                      </span>
                      {chapter.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {chapter.body}
                    </p>

                    {chapter.demo}

                    <div className="rounded-lg border-l-2 border-green-600 dark:border-green-500 bg-green-600/5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="font-medium text-green-700 dark:text-green-400">Key idea: </span>
                      {chapter.keyIdea}
                    </div>

                    {post ? (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 transition-colors hover:text-green-600 dark:hover:text-green-400"
                      >
                        Go deeper: {post.metadata.title} · {getReadingTime(post.content)} min read →
                      </Link>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </article>

      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4 text-sm text-neutral-600 dark:text-neutral-400">
        That&apos;s the whole tour. If you want to keep going, the{' '}
        <Link href="/blog?tag=JavaScript" className="text-green-600 dark:text-green-400 hover:underline">
          JavaScript articles
        </Link>{' '}
        cover each topic in depth, and the{' '}
        <Link href="/dsa" className="text-green-600 dark:text-green-400 hover:underline">
          DSA path
        </Link>{' '}
        does the same for algorithms.
      </div>
    </section>
  )
}
