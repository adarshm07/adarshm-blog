import Link from 'next/link'
import { BPEVisualizer } from '@/app/components/bpe-visualizer'
import { EmbeddingSpaceVisualizer } from '@/app/components/embedding-space-visualizer'
import { ContextWindowVisualizer } from '@/app/components/context-window-visualizer'
import { ToolCallVisualizer } from '@/app/components/tool-call-visualizer'
import { AgentLoopVisualizer } from '@/app/components/agent-loop-visualizer'
import { RagRetrievalVisualizer } from '@/app/components/rag-retrieval-visualizer'
import { EvalMatrixVisualizer } from '@/app/components/eval-matrix-visualizer'
import { PromptInjectionVisualizer } from '@/app/components/prompt-injection-visualizer'
import {
  ApproachVisualizer,
  HallucinationVisualizer,
  SamplingVisualizer,
  StreamingVisualizer,
  StructuredOutputVisualizer,
} from '@/app/components/ai-visualizers'
import { C, type Guide, type Part } from '../guide'

const PARTS: Part[] = [
  {
    id: 'inside-the-model',
    title: 'Inside the model',
    blurb: 'What a language model actually sees, and how it produces text.',
    chapters: [
      {
        id: 'tokens',
        title: 'Tokens',
        body: (
          <>
            Models don&apos;t read letters or words. Text is split into
            tokens — common words whole, rare ones in pieces — by an algorithm
            that learned the pieces from frequency alone. Prices, limits and
            many odd behaviours are all measured in tokens.
          </>
        ),
        demo: <BPEVisualizer />,
        keyIdea: 'The model sees a sequence of token IDs, not characters. Count tokens, not words.',
        post: 'tokenization-and-bpe',
      },
      {
        id: 'embeddings',
        title: 'Embeddings',
        body: (
          <>
            Each token — and, with an embedding model, each whole passage — is
            turned into a long list of numbers. Things with similar meaning end
            up close together in that space, which is what makes semantic
            search possible.
          </>
        ),
        demo: <EmbeddingSpaceVisualizer />,
        keyIdea: 'Meaning becomes position: similar text, nearby vectors.',
        post: 'what-embeddings-actually-are',
      },
      {
        id: 'sampling',
        title: 'Next-token prediction and sampling',
        body: (
          <>
            At every step the model produces a probability for each possible
            next token, and one is drawn. Temperature and top-p shape that
            draw — which is why the same prompt can give different answers.
          </>
        ),
        demo: <SamplingVisualizer />,
        keyIdea: 'A model outputs probabilities; sampling picks the words. Variation is by design.',
        post: 'temperature-and-sampling',
      },
      {
        id: 'hallucinations',
        title: 'Why models hallucinate',
        body: (
          <>
            Trained to produce plausible text, a model will produce plausible
            text even when it has no reliable knowledge — in the same confident
            tone as everything else. Giving it the facts in context is the main
            fix.
          </>
        ),
        demo: <HallucinationVisualizer />,
        keyIdea: 'Plausible isn’t the same as true. Ground answers in sources the model can copy from.',
        post: 'why-llms-hallucinate',
      },
    ],
  },
  {
    id: 'talking-to-the-model',
    title: 'Talking to a model',
    blurb: 'The request, the budget, and getting answers you can use.',
    chapters: [
      {
        id: 'context-windows',
        title: 'Context windows',
        body: (
          <>
            The model has no memory between requests: everything it should
            know — instructions, history, documents — is sent every time, and
            must fit in its context window. Caching makes resending a long,
            stable prefix cheap.
          </>
        ),
        demo: <ContextWindowVisualizer />,
        keyIdea: 'Each request starts from zero. Budget the window like memory, and keep stable parts first.',
        post: 'context-windows-and-caching',
      },
      {
        id: 'streaming',
        title: 'Streaming responses',
        body: (
          <>
            A long answer can take seconds to finish, but the first tokens
            exist almost immediately. Streaming sends them as they&apos;re
            generated, so users start reading in under a second.
          </>
        ),
        demo: <StreamingVisualizer />,
        keyIdea: 'Streaming doesn’t make the model faster — it makes the wait useful.',
        post: 'streaming-llm-responses',
      },
      {
        id: 'structured-outputs',
        title: 'Structured outputs',
        body: (
          <>
            When code consumes the answer, ask for data, not prose. Give the API
            a schema, and generation is constrained to it — every response is
            valid JSON of exactly that shape.
          </>
        ),
        demo: <StructuredOutputVisualizer />,
        keyIdea: 'Schemas guarantee the shape. You still have to check the values.',
        post: 'structured-outputs-from-llms',
      },
    ],
  },
  {
    id: 'models-that-act',
    title: 'Models that act',
    blurb: 'Giving a model tools, and letting it use them in a loop.',
    chapters: [
      {
        id: 'tool-calling',
        title: 'Tool calling',
        body: (
          <>
            You describe functions with a name, a description and a schema.
            The model can&apos;t run them — it asks <em>you</em> to, by
            returning a structured tool call, and you send the result back.
          </>
        ),
        demo: <ToolCallVisualizer />,
        keyIdea: 'The model chooses and fills in the call; your code runs it.',
        post: 'tool-calling-explained',
      },
      {
        id: 'agent-loop',
        title: 'The agent loop',
        body: (
          <>
            An agent is tool calling in a loop: the model calls a tool, reads
            the result, decides what to do next, and repeats until the task is
            done — or a limit you set stops it.
          </>
        ),
        demo: <AgentLoopVisualizer />,
        keyIdea: 'Call, observe, decide, repeat — with a budget and a stopping rule.',
        post: 'the-agent-loop',
      },
    ],
  },
  {
    id: 'knowledge-and-quality',
    title: 'Knowledge, quality, and safety',
    blurb: 'Making a model useful for your data — and knowing it works.',
    chapters: [
      {
        id: 'rag',
        title: 'Retrieval (RAG)',
        body: (
          <>
            For knowledge too big or too fresh for the prompt, split documents
            into chunks, find the ones relevant to each question by embedding
            similarity, and put just those in the context.
          </>
        ),
        demo: <RagRetrievalVisualizer />,
        keyIdea: 'If the right chunk isn’t retrieved, the model can’t use it — retrieval quality is the job.',
        post: 'rag-retrieval-explained',
      },
      {
        id: 'customising',
        title: 'Prompting, RAG, or fine-tuning?',
        body: (
          <>
            Three ways to adapt a general model: change what you ask, change
            what it can see, or change the model itself. They solve different
            problems — and the cheapest one is usually the right first step.
          </>
        ),
        demo: <ApproachVisualizer />,
        keyIdea: 'Prompt first. Retrieve facts. Fine-tune behaviour, not knowledge.',
        post: 'fine-tuning-vs-rag-vs-prompting',
      },
      {
        id: 'evals',
        title: 'Evals',
        body: (
          <>
            Model output varies, so &ldquo;it looked right when I tried it&rdquo;
            isn&apos;t evidence. An eval is a fixed set of cases with a way to
            grade them, run on every change — the tests of LLM apps.
          </>
        ),
        demo: <EvalMatrixVisualizer />,
        keyIdea: 'You can’t improve what you don’t measure — and one sample isn’t a measurement.',
        post: 'evals-for-llm-apps',
      },
      {
        id: 'prompt-injection',
        title: 'Prompt injection',
        body: (
          <>
            A model can&apos;t reliably tell your instructions apart from
            instructions hidden in the content it reads — a web page, an email,
            a document. Treat that content as untrusted and limit what the
            model is allowed to do with it.
          </>
        ),
        demo: <PromptInjectionVisualizer />,
        keyIdea: 'Anything the model reads can try to give it orders. Design permissions as if it will succeed.',
        post: 'prompt-injection',
      },
    ],
  },
]

export const aiGuide: Guide = {
  slug: 'ai',
  title: 'How LLMs Work',
  description:
    'From tokens and probabilities to tools, agents and retrieval — how large language models actually work, and how to build reliable features on them, with an animation for every idea.',
  intro: (
    <>
      Everything between &ldquo;type a prompt&rdquo; and &ldquo;ship an AI
      feature&rdquo;: what the model sees, how it picks words, and how to make
      it useful, reliable and safe. No machine-learning background needed —
    </>
  ),
  outro: (
    <>
      That&apos;s the tour. To build on it, see the{' '}
      <Link href="/blog?tag=AI%20Engineering" className="text-green-600 dark:text-green-400 hover:underline">
        AI Engineering articles
      </Link>
      , or try the{' '}
      <Link href="/tools/system-design" className="text-green-600 dark:text-green-400 hover:underline">
        system design practice tool
      </Link>
      , which calls a model straight from your browser with your own key. Code in the linked articles uses{' '}
      <C>@anthropic-ai/sdk</C>.
    </>
  ),
  parts: PARTS,
}
