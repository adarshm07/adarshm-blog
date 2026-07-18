import fs from 'fs'
import path from 'path'

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard'

export type QuestionMetadata = {
  title: string
  pattern: string
  order: number
  difficulty: QuestionDifficulty
  summary: string
  leetcode?: string
  gfg?: string
}

export type PatternQuestion = {
  metadata: QuestionMetadata
  slug: string
  content: string
}

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  const match = frontmatterRegex.exec(fileContent)
  const frontMatterBlock = match![1]
  const content = fileContent.replace(frontmatterRegex, '').trim()
  const frontMatterLines = frontMatterBlock.trim().split('\n')
  const metadata: Record<string, string> = {}

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    metadata[key.trim()] = value
  })

  return {
    metadata: {
      title: metadata.title,
      pattern: metadata.pattern,
      order: Number(metadata.order ?? 0),
      difficulty: metadata.difficulty as QuestionDifficulty,
      summary: metadata.summary,
      leetcode: metadata.leetcode,
      gfg: metadata.gfg,
    } satisfies QuestionMetadata,
    content,
  }
}

export function getPatternQuestions(): PatternQuestion[] {
  const dir = path.join(process.cwd(), 'src', 'app', 'dsa', 'patterns', 'questions')
  return fs
    .readdirSync(dir)
    .filter((file) => path.extname(file) === '.mdx')
    .map((file) => {
      const { metadata, content } = parseFrontmatter(
        fs.readFileSync(path.join(dir, file), 'utf-8')
      )
      return {
        metadata,
        slug: path.basename(file, path.extname(file)),
        content,
      }
    })
    .sort((a, b) => a.metadata.order - b.metadata.order)
}
