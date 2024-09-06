import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import { UrlObject } from 'url'
import { PlaceholderValue, OnLoadingComplete } from 'next/dist/shared/lib/get-img-props'

function Table({ data }: { data: any }) {
  let headers = data.headers.map((header: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined, index: React.Key | null | undefined) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row: any[], index: React.Key | null | undefined) => (
    <tr key={index}>
      {row.map((cell: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined, cellIndex: React.Key | null | undefined) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props: (React.JSX.IntrinsicAttributes & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof { href: string | UrlObject; as?: string | UrlObject; replace?: boolean; scroll?: boolean; shallow?: boolean; passHref?: boolean; prefetch?: boolean; locale?: string | false; legacyBehavior?: boolean; onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>; onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>; onClick?: React.MouseEventHandler<HTMLAnchorElement> }> & { href: string | UrlObject; as?: string | UrlObject; replace?: boolean; scroll?: boolean; shallow?: boolean; passHref?: boolean; prefetch?: boolean; locale?: string | false; legacyBehavior?: boolean; onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>; onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>; onClick?: React.MouseEventHandler<HTMLAnchorElement> } & { children?: React.ReactNode } & React.RefAttributes<HTMLAnchorElement>) | (React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLAnchorElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>)) {
  let href: any = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    // @ts-ignore
    return <a {...props} />
  }

  // @ts-ignore
  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props: any) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

function Code({ children, ...props }: { children: any, [x: string]: any }) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str: { toString: () => string }) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level: number) {
  const Heading = ({ children }: { children: any }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
}

export function CustomMDX(props: { components: any }) {
  return (
    // @ts-ignore
    <MDXRemote
      components={{ ...components, ...(props.components || {}) }} />
  )
}