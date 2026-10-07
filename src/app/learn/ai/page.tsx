import { GuideView, guideMetadata } from '../guide'
import { aiGuide } from '../guides/ai'

export const metadata = guideMetadata(aiGuide)

export default function Page() {
  return <GuideView guide={aiGuide} />
}
