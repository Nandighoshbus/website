import type { Metadata } from 'next'
import './globals.css'
import ClientRootLayout from '@/components/layout/ClientRootLayout'

export const metadata: Metadata = {
  title: 'Nandighosh Bus - Premium Travel Experience Across Odisha',
  description: 'Book comfortable and reliable bus services across Odisha with Nandighosh Bus. AC sleeper coaches, GPS tracking, and premium amenities for your journey.',
  keywords: 'Nandighosh Bus, Odisha bus service, AC sleeper bus, online bus booking, Balasore to Puri, premium travel Odisha',
  authors: [{ name: 'Nandighosh Bus Service' }],
  creator: 'Nandighosh Bus Service',
  publisher: 'Nandighosh Bus Service',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon-32x32.png', sizes: '180x180', type: 'image/png' }
    ]
  },
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
    width: 'device-width',
    initialScale: 1,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  )
}
