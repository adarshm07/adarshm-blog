import { DIMENSIONS, type Problem } from '@/app/lib/system-design-problems'

export type DesignAnswer = { notes: string; diagramText: string }

const GRADER = `You are a staff engineer running a system design interview. You are grading a written design, and the candidate's architecture diagram, against a fixed rubric.

Be specific and honest. Reward concrete numbers, named trade-offs, and identified bottlenecks. Do not reward vocabulary alone: mentioning "we'll use Kafka" with no reason is not a point. Check the diagram against the notes — a component that is drawn but never justified, or a flow described but missing from the diagram, is worth pointing out. Do not invent things the candidate did not write. If an answer is short or vague, say so and score it low — an inflated score is useless to them.

Score each rubric dimension 0-3:
0 = not addressed
1 = mentioned without substance
2 = solid, with minor gaps
3 = strong, specific, with reasoning`

/** System prompt for the in-page grader, which renders a JSON scorecard. */
export const SYSTEM_DESIGN_JSON_INSTRUCTIONS = `${GRADER}

Reply with JSON only, no prose outside it, no code fences, in exactly this shape:
{"scores":[{"key":"<dimension key>","score":<0-3>,"comment":"<one or two sentences, specific to what they wrote>"}],
 "strengths":["..."],
 "gaps":["what a strong answer would have covered that this one did not"],
 "followUps":["the question an interviewer would ask next"],
 "verdict":"<two sentences: where this lands and the single highest-leverage thing to improve>"}`

/** For claude.ai, where a person reads the reply: Markdown instead of JSON. */
const PASTE_INSTRUCTIONS = `${GRADER}

Reply in Markdown with exactly these sections:
## Scores
One line per rubric dimension: "- <label>: <score>/3 — <one specific sentence>", then the total out of ${DIMENSIONS.length * 3}.
## What works
## Gaps
What a strong answer would have covered that this one did not.
## The diagram
Missing components or connections, and anything drawn that the notes don't justify.
## Follow-up questions
Two or three questions an interviewer would ask next.
## Verdict
Two sentences: where this lands, and the single highest-leverage thing to improve.`

export function buildDesignUserMessage(problem: Problem, answer: DesignAnswer) {
  const rubric = DIMENSIONS.map((d) => `- ${d.key} (${d.label}): ${d.looksLike}`).join('\n')
  return `# Problem
${problem.title}
${problem.prompt}
Stated scale: ${problem.scale}

# Rubric dimensions
${rubric}

# The candidate's written design
${answer.notes.trim() || '(no notes written)'}

# The candidate's architecture diagram
${answer.diagramText}`
}

/** One self-contained message for pasting into claude.ai, which has no separate system prompt. */
export function buildDesignPastePrompt(problem: Problem, answer: DesignAnswer) {
  return `${PASTE_INSTRUCTIONS}\n\n---\n\n${buildDesignUserMessage(problem, answer)}`
}
