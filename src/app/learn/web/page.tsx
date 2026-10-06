import { GuideView, guideMetadata } from '../guide'
import { webGuide } from '../guides/web'

export const metadata = guideMetadata(webGuide)

export default function Page() {
  return <GuideView guide={webGuide} />
}
