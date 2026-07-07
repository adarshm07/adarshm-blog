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
  ScopeChainDiagram,
} from '@/app/components/diagrams'
import { PrototypeChainVisualizer } from '@/app/components/prototype-visualizer'
import { TwoSumTwoPointer } from '@/app/components/two-pointer-visualizer'
import { LongestSubstringWindow } from '@/app/components/sliding-window-visualizer'
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

function createHeading(level: number) {
  const Heading = ({ children }: { children: string }) => {
    const slug = slugify(children)
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
  ScopeChainDiagram,
  PrototypeChainVisualizer,
  TwoSumTwoPointer,
  LongestSubstringWindow,
}

export function CustomMDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components ?? {}) }}
    />
  )
}
