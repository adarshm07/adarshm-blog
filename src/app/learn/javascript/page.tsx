import { GuideView, guideMetadata } from '../guide'
import { javascriptGuide } from '../guides/javascript'

export const metadata = guideMetadata(javascriptGuide)

export default function Page() {
  return <GuideView guide={javascriptGuide} />
}
