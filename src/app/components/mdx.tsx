import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import { SortVisualizer } from '@/app/components/sort-visualizer'
import { EventLoopVisualizer } from '@/app/components/event-loop-visualizer'
import {
  BinarySearchVisualizer,
  BSTVisualizer,
} from '@/app/components/binary-search-visualizer'
import { SignalTimeline } from '@/app/components/signal-timeline'
import { HashMapVisualizer } from '@/app/components/hashmap-visualizer'
import { LRUVisualizer } from '@/app/components/lru-visualizer'
import { RateLimiterVisualizer } from '@/app/components/rate-limiter-visualizer'
import { MessageFlowVisualizer } from '@/app/components/message-flow-visualizer'
import {
  PromiseStateDiagram,
  PrototypeChainDiagram,
  ScopeChainDiagram,
} from '@/app/components/diagrams'
import { PrototypeChainVisualizer } from '@/app/components/prototype-chain-visualizer'
import { SlidingWindowVisualizer } from '@/app/components/sliding-window-visualizer'
import { CallStackVisualizer } from '@/app/components/call-stack-visualizer'
import {
  GraphBFSVisualizer,
  GraphDFSVisualizer,
} from '@/app/components/graph-traversal-visualizer'
import { DPTableVisualizer } from '@/app/components/dp-table-visualizer'
import { LinkedListCycleVisualizer } from '@/app/components/linked-list-cycle-visualizer'
import { HeapVisualizer } from '@/app/components/heap-visualizer'
import { TrieVisualizer } from '@/app/components/trie-visualizer'
import { BitVisualizer } from '@/app/components/bit-visualizer'
import { ConsistentHashRingVisualizer } from '@/app/components/consistent-hash-ring-visualizer'
import { GeneratorVisualizer } from '@/app/components/generator-visualizer'
import { MonotonicStackVisualizer } from '@/app/components/monotonic-stack-visualizer'
import { PrefixSumVisualizer } from '@/app/components/prefix-sum-visualizer'
import { AStarGridVisualizer } from '@/app/components/astar-grid-visualizer'
import { ShardingVisualizer } from '@/app/components/sharding-visualizer'
import { RetryBackoffVisualizer } from '@/app/components/retry-backoff-visualizer'
import { CircuitBreakerVisualizer } from '@/app/components/circuit-breaker-visualizer'
import { LogPartitionVisualizer } from '@/app/components/log-partition-visualizer'
import { HoistingVisualizer } from '@/app/components/hoisting-visualizer'
import { WorkerThreadVisualizer } from '@/app/components/worker-thread-visualizer'
import { StructuralSharingVisualizer } from '@/app/components/structural-sharing-visualizer'
import { AgentLoopVisualizer } from '@/app/components/agent-loop-visualizer'
import { ToolCallVisualizer } from '@/app/components/tool-call-visualizer'
import { ContextWindowVisualizer } from '@/app/components/context-window-visualizer'
import { RagRetrievalVisualizer } from '@/app/components/rag-retrieval-visualizer'
import { FenwickVisualizer } from '@/app/components/fenwick-visualizer'
import { MSTVisualizer } from '@/app/components/mst-visualizer'
import { LeaseFencingVisualizer } from '@/app/components/lease-fencing-visualizer'
import { TraceWaterfallVisualizer } from '@/app/components/trace-waterfall-visualizer'
import { BackpressureVisualizer } from '@/app/components/backpressure-visualizer'
import { RenderPipelineVisualizer } from '@/app/components/render-pipeline-visualizer'
import { EvalMatrixVisualizer } from '@/app/components/eval-matrix-visualizer'
import { PredicateSearchVisualizer } from '@/app/components/predicate-search-visualizer'
import { LISVisualizer } from '@/app/components/lis-visualizer'
import { ReservoirVisualizer } from '@/app/components/reservoir-visualizer'
import { CancellationVisualizer } from '@/app/components/cancellation-visualizer'
import { RegexBacktrackingVisualizer } from '@/app/components/regex-backtracking-visualizer'
import { TimezoneVisualizer } from '@/app/components/timezone-visualizer'
import { PaginationDriftVisualizer } from '@/app/components/pagination-drift-visualizer'
import { OutboxVisualizer } from '@/app/components/outbox-visualizer'
import { PromptInjectionVisualizer } from '@/app/components/prompt-injection-visualizer'
import { EmbeddingSpaceVisualizer } from '@/app/components/embedding-space-visualizer'
import { CopyButton } from '@/app/components/copy-button'

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  return (
    <table>
      <thead>
        <tr>
          {data.headers.map((header, i) => (
            <th key={i}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CustomLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }
  if (href.startsWith('#')) {
    return <a href={href} {...props}>{children}</a>
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

function RoundedImage({
  alt,
  ...props
}: React.ComponentProps<typeof Image>) {
  return <Image alt={alt} className="rounded-xl" {...props} />
}

function Code({ children, ...props }: { children: string }) {
  const codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function Pre({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  let code = ''
  if (React.isValidElement(children)) {
    const childProps = children.props as { children?: unknown }
    if (typeof childProps.children === 'string') {
      code = childProps.children
    }
  }
  return (
    <div className="group relative">
      <CopyButton code={code} />
      <pre {...props}>{children}</pre>
    </div>
  )
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

/**
 * A heading with inline markup (`code`, *emphasis*, a link) arrives as an
 * array of nodes rather than a string, so flatten it before slugifying.
 */
function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) return children.map(childrenToText).join('')
  if (React.isValidElement(children)) {
    return childrenToText((children.props as { children?: React.ReactNode }).children)
  }
  return ''
}

function createHeading(level: number) {
  const Heading = ({ children }: { children: React.ReactNode }) => {
    const slug = slugify(childrenToText(children))
    return React.createElement(
      `h${level}`,
      { id: slug },
      React.createElement('a', {
        href: `#${slug}`,
        key: `link-${slug}`,
        className: 'anchor',
      }),
      children
    )
  }
  Heading.displayName = `Heading${level}`
  return Heading
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  pre: Pre,
  Table,
  SortVisualizer,
  EventLoopVisualizer,
  BinarySearchVisualizer,
  BSTVisualizer,
  SignalTimeline,
  HashMapVisualizer,
  LRUVisualizer,
  RateLimiterVisualizer,
  MessageFlowVisualizer,
  PromiseStateDiagram,
  PrototypeChainDiagram,
  ScopeChainDiagram,
  PrototypeChainVisualizer,
  SlidingWindowVisualizer,
  CallStackVisualizer,
  GraphBFSVisualizer,
  GraphDFSVisualizer,
  DPTableVisualizer,
  LinkedListCycleVisualizer,
  HeapVisualizer,
  TrieVisualizer,
  BitVisualizer,
  ConsistentHashRingVisualizer,
  GeneratorVisualizer,
  MonotonicStackVisualizer,
  PrefixSumVisualizer,
  AStarGridVisualizer,
  ShardingVisualizer,
  RetryBackoffVisualizer,
  CircuitBreakerVisualizer,
  LogPartitionVisualizer,
  HoistingVisualizer,
  WorkerThreadVisualizer,
  StructuralSharingVisualizer,
  AgentLoopVisualizer,
  ToolCallVisualizer,
  ContextWindowVisualizer,
  RagRetrievalVisualizer,
  FenwickVisualizer,
  MSTVisualizer,
  LeaseFencingVisualizer,
  TraceWaterfallVisualizer,
  BackpressureVisualizer,
  RenderPipelineVisualizer,
  EvalMatrixVisualizer,
  PredicateSearchVisualizer,
  LISVisualizer,
  ReservoirVisualizer,
  CancellationVisualizer,
  RegexBacktrackingVisualizer,
  TimezoneVisualizer,
  PaginationDriftVisualizer,
  OutboxVisualizer,
  PromptInjectionVisualizer,
  EmbeddingSpaceVisualizer,
}

export function CustomMDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components ?? {}) }}
    />
  )
}
