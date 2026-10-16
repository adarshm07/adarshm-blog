import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { SearchPalette } from './components/search-palette'
import Footer from './components/footer'
import { baseUrl } from './sitemap'

const SITE_TITLE = 'Adarsh M — Software Engineer & Blog'
const SITE_DESCRIPTION =
  'Adarsh M — full-stack software engineer writing about JavaScript, system design, DSA and AI engineering.'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_TITLE,
    template: '%s | Adarsh M',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Adarsh M',
    'Adarsh M software engineer',
    'adarshm07',
    'software engineer',
    'JavaScript',
    'web development',
    'data structures',
    'algorithms',
    'system design',
    'blog',
  ],
  authors: [{ name: 'Adarsh M', url: baseUrl }],
  creator: 'Adarsh M',
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: baseUrl,
    siteName: 'Adarsh M',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `/og?title=${encodeURIComponent('Adarsh M')}`,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: '@adarshm07',
    images: [`/og?title=${encodeURIComponent('Adarsh M')}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} text-black bg-white dark:text-white dark:bg-[#0a0a0a]`}
    >
      <body className="antialiased max-w-2xl mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar search={<SearchPalette />} />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  )
}
