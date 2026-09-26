'use client'

import { Layout } from '@/components/Layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState, type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      })
  )

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="blueskills-theme"
    >
      <QueryClientProvider client={queryClient}>
        <Layout>{children}</Layout>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
