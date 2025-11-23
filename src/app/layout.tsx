import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

// Force all pages to be dynamic (no static generation)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "WanderPlan - Travel Planning Made Easy",
  description:
    "A comprehensive travel planning web application that enables users to create detailed itineraries, collaborate with others, manage budgets, and organize all travel-related information in one place.",
  keywords: [
    "travel planning",
    "itinerary builder",
    "trip planner",
    "travel collaboration",
    "budget tracking",
  ],
  authors: [{ name: "WanderPlan Team" }],
  creator: "WanderPlan",
  publisher: "WanderPlan",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wanderplan.com",
    title: "WanderPlan - Travel Planning Made Easy",
    description:
      "Create detailed itineraries, collaborate with others, and organize all your travel information in one place.",
    siteName: "WanderPlan",
  },
  twitter: {
    card: "summary_large_image",
    title: "WanderPlan - Travel Planning Made Easy",
    description:
      "Create detailed itineraries, collaborate with others, and organize all your travel information in one place.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
