import localFont from 'next/font/local'
import { Tajawal, Comfortaa } from 'next/font/google'
import { LangProvider } from '@/context/LangContext'
import { ThemeProvider } from '@/context/ThemeContext'
import '@/app/globals.css'

const gotham = localFont({
  src: [
    { path: '../public/fonts/gotham/Gotham-Light.otf',  weight: '300', style: 'normal' },
    { path: '../public/fonts/gotham/Gotham-Book.otf',   weight: '400', style: 'normal' },
    { path: '../public/fonts/gotham/Gotham-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/gotham/Gotham-Bold.otf',   weight: '700', style: 'normal' },
    { path: '../public/fonts/gotham/Gotham-Black.otf',  weight: '900', style: 'normal' },
  ],
  variable: '--font-gotham',
  display: 'swap',
})

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
})

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-comfortaa',
  display: 'swap',
})

export const metadata = {
  title: 'Grace Academy — Long Live Learn',
  description: 'A complete English learning ecosystem built for every age.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning>
      <body className={`${gotham.variable} ${tajawal.variable} ${comfortaa.variable}`}>
        <ThemeProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
