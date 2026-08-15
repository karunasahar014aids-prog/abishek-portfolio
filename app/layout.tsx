import type { Metadata, Viewport } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ABISHEK — Photography · Stories · Emotions",
  description:
    "The portfolio of Abishek, a photographer capturing stories and emotions through cinematic, timeless imagery.",
  keywords: ["photography", "portfolio", "Abishek", "cinematic", "storytelling"],
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
