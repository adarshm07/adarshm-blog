import { LLD_RUBRIC, type LldProblem } from '@/app/lib/lld-problems'

export type LldAnswer = {
  notes: string
  code: string
  language: string
  diagramText: string
}

/** Instructions for the reviewer — the system prompt in the API path. */
export const LLD_REVIEW_INSTRUCTIONS = `You are a senior engineer running a low-level design (object-oriented design) interview. Review the candidate's answer below: their notes, their class diagram (given as text), and any code.

Be specific and honest. Refer to their actual classes and methods by name. Reward clear responsibilities, correct relationships, and change points placed behind interfaces. Do not reward design-pattern names used without a reason. Do not invent things they did not write. If the answer is thin, say so — an inflated score is useless to them.

Score each rubric area from 0 to 3:
0 = not addressed · 1 = mentioned without substance · 2 = solid, minor gaps · 3 = strong and well reasoned

Reply in Markdown with exactly these sections:
## Scores
One line per rubric area: "- <area>: <score>/3 — <one specific sentence>"
## What works
## Gaps
## Concrete changes
Specific edits at the level of classes, methods and relationships — what to add, split, rename or remove, and why.
## Follow-up questions
Two or three questions an interviewer would ask next.`

export function buildLldUserMessage(problem: LldProblem, answer: LldAnswer) {
  const rubric = LLD_RUBRIC.map((r) => `- ${r.label}: ${r.looksLike}`).join('\n')
  const requirements = problem.requirements.map((r) => `- ${r}`).join('\n')
  const expected = problem.wouldExpect.map((r) => `- ${r}`).join('\n')
  const code = answer.code.trim()
    ? `\`\`\`${answer.language.toLowerCase()}\n${answer.code.trim()}\n\`\`\``
    : '(no code written)'

  return `# Problem: ${problem.title}
${problem.prompt}

## Requirements
${requirements}

## Rubric
${rubric}

## What strong answers usually include (for your reference — don't just check it off)
${expected}

# Candidate's answer

## Notes
${answer.notes.trim() || '(no notes written)'}

## Class diagram
${answer.diagramText}

## Code (${answer.language})
${code}`
}

/** One self-contained message for pasting into claude.ai, which has no separate system prompt. */
export function buildLldPastePrompt(problem: LldProblem, answer: LldAnswer) {
  return `${LLD_REVIEW_INSTRUCTIONS}\n\n---\n\n${buildLldUserMessage(problem, answer)}`
}
