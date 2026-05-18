import { Montserrat, Tajawal } from 'next/font/google'
import { LangProvider } from '@/context/LangContext'
import { ThemeProvider } from '@/context/ThemeContext'
import '@/app/globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
})

export const metadata = {
  title: 'Grace Academy — Long Live Learn',
  description: 'A complete English learning ecosystem built for every age.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${tajawal.variable}`}>
        <ThemeProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
