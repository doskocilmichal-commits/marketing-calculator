import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Marketing Decision Calculator',
  description: 'Turn marketing metrics into revenue, profit and ROI — in seconds.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 antialiased dark:bg-slate-950`}
      >
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
          <header>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
              Marketing Decision Calculator
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Marketing metrics in, business outcomes out.
            </p>
          </header>

          <Nav />

          <main className="mt-6">{children}</main>

          <footer className="mt-12 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">
            All amounts in CZK. Nothing is saved — close the tab and it is gone.
          </footer>
        </div>
      </body>
    </html>
  )
}
