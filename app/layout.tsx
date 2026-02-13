import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'FreshCart - Collaborative Grocery Shopping',
  description:
    'Shop smarter together. Shared lists, group chat, budget tracking, and payment splitting for households and groups.',
}

export const viewport: Viewport = {
  themeColor: '#2d8a56',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
