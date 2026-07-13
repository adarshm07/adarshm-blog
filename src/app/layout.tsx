import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import Footer from './components/footer'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'adarshm.com',
    template: '%s | adarshm.com',
  },
  description: 'Adarsh M. — JavaScript developer writing about the web.',
  keywords: [
    'Adarsh M',
    'software engineer',
    'JavaScript',
    'web development',
    'data structures',
    'algorithms',
    'system design',
    'blog',
  ],
  authors: [{ name: 'Adarsh M.', url: baseUrl }],
  creator: 'Adarsh M.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'adarshm.com',
    description: 'Adarsh M. — JavaScript developer writing about the web.',
    url: baseUrl,
    siteName: 'adarshm.com',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `/og?title=${encodeURIComponent('adarshm.com')}`,
        width: 1200,
        height: 630,
        alt: 'adarshm.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'adarshm.com',
    description: 'Adarsh M. — JavaScript developer writing about the web.',
    creator: '@adarshm07',
    images: [`/og?title=${encodeURIComponent('adarshm.com')}`],
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
      className={`${GeistSans.variable} ${GeistMono.variable} text-ink bg-bg`}
    >
      <body className="antialiased max-w-2xl mx-4 mt-8 lg:mx-auto">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(70%_100%_at_50%_0%,var(--glow),transparent_70%)]"
        />
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  )
}
