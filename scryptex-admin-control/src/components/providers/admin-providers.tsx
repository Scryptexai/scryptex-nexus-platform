
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'
import { Toaster } from 'sonner'

interface AdminProvidersProps {
  children: ReactNode
}

export function AdminProviders({ children }: AdminProvidersProps) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
              return false
            }
            return failureCount < 3
          },
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-right"
        theme="dark"
        richColors
        closeButton
        expand={true}
        duration={5000}
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </QueryClientProvider>
  )
}
