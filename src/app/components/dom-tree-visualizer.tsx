'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const HTML = [
  '<body>',
  '  <h1>Groceries</h1>',
  '  <ul id="list">',
  '    <li>Milk</li>',
  '    <li>Eggs</li>',
  '  </ul>',
  '</body>',
]

type Node = { id: string; depth: number; label: string; text?: string }

const BASE: Node[] = [
  { id: 'doc', depth: 0, label: 'document' },
  { id: 'body', depth: 1, label: 'body' },
  { id: 'h1', depth: 2, label: 'h1', text: '"Groceries"' },
  { id: 'ul', depth: 2, label: 'ul#list' },
  { id: 'li1', depth: 3, label: 'li', text: '"Milk"' },
  { id: 'li2', depth: 3, label: 'li', text: '"Eggs"' },
]

type Step = {
  js?: string[]
  nodes: Node[]
  hot?: string[]
  fresh?: string
  showHtml?: boolean
  note: string
}

const withBread: Node[] = [...BASE, { id: 'li3', depth: 3, label: 'li', text: '"Bread"' }]
const renamed = (nodes: Node[]) =>
  nodes.map((n) => (n.id === 'h1' ? { ...n, text: '"Shopping list"' } : n))

const steps: Step[] = [
  {
    showHtml: true,
    nodes: [],
    note: 'HTML is just text. The browser reads it top to bottom and builds a tree of objects in memory — the DOM (Document Object Model). That tree, not the text, is what you see and what JavaScript changes.',
  },
  {
    showHtml: true,
    nodes: BASE,
    note: 'Every tag becomes a node; nesting becomes parent and child. body contains h1 and ul; ul contains two li nodes; text inside a tag becomes a text node.',
  },
  {
    js: ["const list = document.querySelector('#list')"],
    nodes: BASE,
    hot: ['ul'],
    note: 'querySelector finds a node using a CSS selector — here the element with id "list". You get back an object you can read and change.',
  },
  {
    js: ["document.querySelector('h1').textContent = 'Shopping list'"],
    nodes: renamed(BASE),
    hot: ['h1'],
    note: 'Change a property on the node and the page updates. The HTML file on the server never changes — only the tree in this tab.',
  },
  {
    js: ["const item = document.createElement('li')", "item.textContent = 'Bread'", 'list.append(item)'],
    nodes: renamed(withBread),
    fresh: 'li3',
    note: 'createElement makes a new node, detached from the page. append attaches it as the last child of the list — and it appears on screen.',
  },
  {
    js: ["list.addEventListener('click', (e) => {", '  e.target.remove()', '})'],
    nodes: renamed(withBread),
    hot: ['ul'],
    note: 'Nodes also receive events. One listener on the ul catches clicks on any li inside it, because events bubble up the tree from the clicked node to its parents.',
  },
  {
    js: ['// user clicks "Eggs"'],
    nodes: renamed(withBread).filter((n) => n.id !== 'li2'),
    hot: ['ul'],
    note: 'Click "Eggs": the event starts at that li, bubbles to the ul, the listener runs, and e.target — the li actually clicked — removes itself. Find, change, create, listen: that is most of working with the DOM.',
  },
]

export function DomTreeVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-1 font-mono text-[9.5px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  {step.showHtml ? 'HTML (text)' : 'JavaScript'}
                </div>
                <div className="min-h-24 overflow-x-auto whitespace-pre rounded-lg bg-neutral-50 dark:bg-neutral-900 p-2 font-mono text-[10.5px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                  {(step.showHtml ? HTML : step.js ?? []).join('\n')}
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 font-mono text-[9.5px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  DOM tree (objects)
                </div>
                <div className="min-h-24 rounded-lg border border-neutral-100 dark:border-neutral-800 p-2 font-mono text-[10.5px] leading-relaxed">
                  {step.nodes.length === 0 ? (
                    <span className="text-neutral-300 dark:text-neutral-600">not built yet</span>
                  ) : (
                    step.nodes.map((n) => (
                      <div key={n.id} style={{ paddingLeft: `${n.depth * 14}px` }}>
                        <span
                          className={[
                            'rounded px-1 transition-colors duration-300',
                            step.fresh === n.id
                              ? 'bg-green-600 dark:bg-green-500 text-white'
                              : step.hot?.includes(n.id)
                                ? 'bg-amber-500 text-white'
                                : 'text-neutral-700 dark:text-neutral-200',
                          ].join(' ')}
                        >
                          {n.depth > 0 ? '└ ' : ''}
                          {n.label}
                        </span>
                        {n.text ? (
                          <span className="ml-1.5 text-neutral-400 dark:text-neutral-500">{n.text}</span>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
