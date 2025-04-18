import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/components/supabase-provider"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ArtHub - Connect Artists, Curators, and Galleries",
  description: "A platform for visual artists, curators, and galleries to connect through a social inventory system.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SupabaseProvider>{children}</SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
