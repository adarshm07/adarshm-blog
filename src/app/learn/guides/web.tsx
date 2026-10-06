import Link from 'next/link'
import {
  ApiRequestVisualizer,
  CookieSessionVisualizer,
  CorsVisualizer,
  DnsLookupVisualizer,
  HttpCacheVisualizer,
  HttpExchangeVisualizer,
  TlsHandshakeVisualizer,
  UrlJourneyVisualizer,
} from '@/app/components/web-visualizers'
import { MessageFlowVisualizer } from '@/app/components/message-flow-visualizer'
import { DomTreeVisualizer } from '@/app/components/dom-tree-visualizer'
import { RenderPipelineVisualizer } from '@/app/components/render-pipeline-visualizer'
import { C, type Guide, type Part } from '../guide'

const PARTS: Part[] = [
  {
    id: 'the-journey',
    title: 'The journey of a request',
    blurb: 'From typing an address to reaching the right machine.',
    chapters: [
      {
        id: 'type-a-url',
        title: 'What happens when you press Enter',
        body: (
          <>
            Loading a page takes four separate systems working together: your
            browser, DNS, the network, and a server somewhere in the world.
            This chapter is the map; the rest of the guide zooms in on each
            stop.
          </>
        ),
        demo: <UrlJourneyVisualizer />,
        keyIdea: 'Name → address → secure connection → request → response → pixels.',
        post: 'what-happens-when-you-type-a-url',
      },
      {
        id: 'dns',
        title: 'DNS: names into addresses',
        body: (
          <>
            Computers connect to IP addresses, not names. DNS finds the address
            for a name by asking a chain of servers — the root, then the{' '}
            <C>.com</C> servers, then the domain&apos;s own — and caches every
            answer so most lookups never make the full trip.
          </>
        ),
        demo: <DnsLookupVisualizer />,
        keyIdea: 'Each level only knows the next level down. TTLs decide how long answers are cached.',
        post: 'dns-explained',
      },
    ],
  },
  {
    id: 'the-conversation',
    title: 'The conversation',
    blurb: 'How the browser and server talk, privately.',
    chapters: [
      {
        id: 'https',
        title: 'HTTPS and the TLS handshake',
        body: (
          <>
            Before any page data is sent, browser and server agree on a secret
            key that nobody listening can work out, and the server proves it
            really is the site you asked for with a certificate. That&apos;s
            the padlock.
          </>
        ),
        demo: <TlsHandshakeVisualizer />,
        keyIdea: 'Key exchange gives privacy; the certificate gives identity. You need both.',
        post: 'https-and-tls-handshake',
      },
      {
        id: 'http',
        title: 'HTTP requests and responses',
        body: (
          <>
            Every page, image and API call is the same exchange: a request with
            a method (<C>GET</C>, <C>POST</C>…), a path and headers, and a
            response with a status code, headers and a body.
          </>
        ),
        demo: <HttpExchangeVisualizer />,
        keyIdea: 'Read the status code’s first digit: 2xx worked, 4xx your mistake, 5xx theirs.',
        post: 'http-requests-and-responses',
      },
    ],
  },
  {
    id: 'state-security-speed',
    title: 'Memory, safety, and speed',
    blurb: 'How sites remember you, protect you, and avoid repeating work.',
    chapters: [
      {
        id: 'cookies',
        title: 'Cookies and sessions',
        body: (
          <>
            HTTP forgets you after every request. A cookie is a small value the
            browser sends back automatically each time — usually a random
            session ID the server uses to look up who you are.
          </>
        ),
        demo: <CookieSessionVisualizer />,
        keyIdea: 'The server remembers; the cookie only reminds it which memory is yours.',
        post: 'cookies-and-sessions',
      },
      {
        id: 'cors',
        title: 'CORS and the same-origin policy',
        body: (
          <>
            A page may send requests anywhere, but it can only <em>read</em>{' '}
            responses from its own origin — unless the other server says
            otherwise with CORS headers. It stops one site reading your data on
            another.
          </>
        ),
        demo: <CorsVisualizer />,
        keyIdea: 'CORS errors are fixed on the server being called, never in the calling page.',
        post: 'cors-explained',
      },
      {
        id: 'caching',
        title: 'HTTP caching',
        body: (
          <>
            The fastest request is the one never sent. <C>Cache-Control</C>{' '}
            says how long a response can be reused as-is, and an{' '}
            <C>ETag</C> lets the browser cheaply check whether a stale copy is
            still good.
          </>
        ),
        demo: <HttpCacheVisualizer />,
        keyIdea: 'Name files by their content and cache them forever; keep the HTML fresh.',
        post: 'http-caching-headers',
      },
    ],
  },
  {
    id: 'building-on-http',
    title: 'Building on HTTP',
    blurb: 'How programs talk to each other — and keep talking.',
    chapters: [
      {
        id: 'apis',
        title: 'APIs, REST, and JSON',
        body: (
          <>
            An API is a set of requests a server agrees to answer for other
            programs. A REST API uses URLs for things, HTTP methods for actions,
            and JSON for data — so your app never touches the database
            directly.
          </>
        ),
        demo: <ApiRequestVisualizer />,
        keyIdea: 'URLs are nouns, methods are verbs, status codes are the result.',
        post: 'what-is-an-api',
      },
      {
        id: 'real-time',
        title: 'Real-time: polling, SSE, and WebSockets',
        body: (
          <>
            Plain HTTP only answers when asked. For chat, live scores and
            notifications, the browser either asks repeatedly, keeps a response
            open for the server to stream into, or upgrades to a WebSocket — a
            connection either side can send on at any time.
          </>
        ),
        demo: <MessageFlowVisualizer scenario="websocket" />,
        keyIdea: 'Pick the simplest one that works: SSE for server → client, WebSockets for both ways.',
        post: 'websockets-sse-polling',
      },
    ],
  },
  {
    id: 'bytes-to-pixels',
    title: 'From bytes to pixels',
    blurb: 'What the browser does with the HTML once it arrives.',
    chapters: [
      {
        id: 'the-dom',
        title: 'The DOM',
        body: (
          <>
            The browser parses HTML into a tree of objects — the DOM. That tree
            is what&apos;s drawn on screen, and it&apos;s what JavaScript
            reads and changes.
          </>
        ),
        demo: <DomTreeVisualizer />,
        keyIdea: 'HTML is text; the DOM is the live tree built from it.',
        post: 'the-dom-explained',
      },
      {
        id: 'rendering',
        title: 'Style, layout, paint, composite',
        body: (
          <>
            To draw the tree, the browser works out each element&apos;s styles,
            computes where every box goes, paints the pixels, and composites
            the layers. Some changes redo all of it; <C>transform</C> and{' '}
            <C>opacity</C> can skip straight to the end.
          </>
        ),
        demo: <RenderPipelineVisualizer />,
        keyIdea: 'The earlier in the pipeline a change starts, the more work it costs.',
        post: 'rendering-pipeline-reflow-repaint',
      },
    ],
  },
]

export const webGuide: Guide = {
  slug: 'web',
  title: 'How the Web Works',
  description:
    'What really happens when you load a web page — DNS, HTTPS, HTTP, cookies, CORS, caching, APIs and rendering — explained step by step with an animation for every idea.',
  intro: (
    <>
      Follow a single page load from the address bar to the screen, and
      everything that makes it secure, fast and personal along the way. No
      background needed —
    </>
  ),
  outro: (
    <>
      That&apos;s the whole trip. Next, see{' '}
      <Link href="/learn/javascript" className="text-green-600 dark:text-green-400 hover:underline">
        How JavaScript Works
      </Link>{' '}
      for what happens once your code runs, or the{' '}
      <Link href="/blog?tag=System%20Design" className="text-green-600 dark:text-green-400 hover:underline">
        system design articles
      </Link>{' '}
      for what happens on the server side at scale.
    </>
  ),
  parts: PARTS,
}
