import Link from 'next/link'
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
import { StackHeapVisualizer } from '@/app/components/stack-heap-visualizer'
import { GCMarkSweepVisualizer } from '@/app/components/gc-mark-sweep-visualizer'
import { HiddenClassVisualizer } from '@/app/components/hidden-class-visualizer'
import { CoercionVisualizer } from '@/app/components/coercion-visualizer'
import { CallbackVisualizer, VariableScopeVisualizer } from '@/app/components/beginner-js-visualizers'
import { DomTreeVisualizer } from '@/app/components/dom-tree-visualizer'
import { C, type Guide, type Part } from '../guide'

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
        id: 'variables',
        title: 'Variables: let, const, and var',
        body: (
          <>
            A variable is a name for a value. <C>let</C> and <C>const</C>{' '}
            live inside the nearest <C>{'{ }'}</C> block; the older{' '}
            <C>var</C> ignores blocks and belongs to the whole function, which
            is behind one of JavaScript&apos;s most famous bugs.
          </>
        ),
        demo: <VariableScopeVisualizer />,
        keyIdea: 'Use const by default, let when the value must change, and never var in new code.',
        post: 'let-const-and-var',
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
    id: 'memory',
    title: 'Memory',
    blurb: 'Where your data lives, and how the engine cleans up after you.',
    chapters: [
      {
        id: 'stack-and-heap',
        title: 'The stack and the heap',
        body: (
          <>
            A running program uses two kinds of memory. The <em>stack</em>{' '}
            holds each function&apos;s local variables and disappears the
            moment the function returns. The <em>heap</em> holds objects, which
            live on for as long as something still points to them.
          </>
        ),
        demo: <StackHeapVisualizer />,
        keyIdea: 'Local variables live and die with their function. Objects live on the heap until nothing references them.',
        post: 'stack-and-heap-in-javascript',
      },
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
        id: 'garbage-collection',
        title: 'Garbage collection',
        body: (
          <>
            You never free memory yourself in JavaScript. Every so often the
            garbage collector starts from the <em>roots</em> — globals and the
            variables of running functions — marks everything it can reach,
            and frees the rest. Objects that only point at each other still get
            collected.
          </>
        ),
        demo: <GCMarkSweepVisualizer />,
        keyIdea: 'Reachable from a root = kept. Unreachable = freed. A memory leak is something you forgot is still reachable.',
        post: 'javascript-memory-management',
      },
    ],
  },
  {
    id: 'values-and-objects',
    title: 'Values and objects',
    blurb: 'How values convert, how objects share behaviour, and how the engine keeps them fast.',
    chapters: [
      {
        id: 'type-coercion',
        title: 'Type coercion',
        body: (
          <>
            When an operator gets values of the wrong type, JavaScript quietly
            converts them. The rules are consistent, but they combine into
            famous surprises like <C>{"'5' + 1"}</C> being <C>{"'51'"}</C>.
            Knowing the few rules — and using <C>===</C> — removes the mystery.
          </>
        ),
        demo: <CoercionVisualizer />,
        keyIdea: '+ with a string joins text; every other math operator converts to numbers; == converts, === never does.',
        post: 'javascript-type-coercion',
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
        id: 'hidden-classes',
        title: 'Hidden classes and inline caches',
        body: (
          <>
            Property lookups are fast because the engine quietly gives every
            object a hidden <em>shape</em>: a layout that says which property
            sits in which slot. Objects built the same way share a shape, and
            each property access remembers the shapes it has seen, so it can
            skip the lookup next time.
          </>
        ),
        demo: <HiddenClassVisualizer />,
        keyIdea: 'Build objects the same way, in the same order, and property access stays fast.',
        post: 'hidden-classes-and-inline-caches',
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
        id: 'callbacks',
        title: 'Callbacks',
        body: (
          <>
            Functions are values, so you can pass one to another function to
            be called later. Some callbacks run straight away — like the ones{' '}
            <C>map</C> and <C>forEach</C> take — and others run when something finishes,
            like a timer or a click — and JavaScript carries on in the
            meantime.
          </>
        ),
        demo: <CallbackVisualizer />,
        keyIdea: 'Pass the function, don\'t call it. Async callbacks run later — everything below runs first.',
        post: 'callbacks-explained',
      },
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
        id: 'the-dom',
        title: 'The DOM',
        body: (
          <>
            The browser turns your HTML into a tree of objects — the DOM — and
            that tree is what&apos;s on screen. JavaScript finds nodes with
            selectors, changes their properties, creates and removes them, and
            listens for events that bubble up the tree.
          </>
        ),
        demo: <DomTreeVisualizer />,
        keyIdea: 'HTML is text; the DOM is the live tree built from it. Change the tree and the page changes.',
        post: 'the-dom-explained',
      },
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

export const javascriptGuide: Guide = {
  slug: 'javascript',
  title: 'How JavaScript Works',
  description:
    'One page, start to finish: how the engine runs your code, where your data lives in memory, how async works, and what the browser does with it all — every idea with an animation you can step through.',
  intro: (
    <>
      Everything you need to understand what JavaScript is really doing, on one
      page and in order. No prior knowledge beyond writing a little JavaScript is
      assumed —
    </>
  ),
  outro: (
    <>
      That&apos;s the whole tour. Next, see{' '}
      <Link href="/learn/web" className="text-green-600 dark:text-green-400 hover:underline">
        How the Web Works
      </Link>
      , the{' '}
      <Link href="/blog?tag=TypeScript" className="text-green-600 dark:text-green-400 hover:underline">
        TypeScript articles
      </Link>{' '}
      for adding types on top, or the{' '}
      <Link href="/dsa" className="text-green-600 dark:text-green-400 hover:underline">
        DSA path
      </Link>{' '}
      for algorithms.
    </>
  ),
  parts: PARTS,
}
