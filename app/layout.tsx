import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nandighosh Bus - Premium Travel Experience Across Odisha',
  description: 'Book comfortable and reliable bus services across Odisha with Nandighosh Bus. AC sleeper coaches, GPS tracking, and premium amenities for your journey.',
  keywords: 'Nandighosh Bus, Odisha bus service, AC sleeper bus, online bus booking, Balasore to Puri, premium travel Odisha',
  authors: [{ name: 'Nandighosh Bus Service' }],
  creator: 'Nandighosh Bus Service',
  publisher: 'Nandighosh Bus Service',
  openGraph: {
    title: 'Nandighosh Bus - Premium Travel Experience',
    description: 'Connecting Odisha with comfortable and reliable bus services',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nandighosh Bus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nandighosh Bus - Premium Travel Experience',
    description: 'Connecting Odisha with comfortable and reliable bus services',
  },
  manifest: '/site.webmanifest',
}

export function generateViewport() {
  return {
    themeColor: '#ea580c',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
