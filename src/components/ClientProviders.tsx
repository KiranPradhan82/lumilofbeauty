'use client'

import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { useApiErrorHandler } from '@/components/ErrorDisplay'

function ErrorInterceptors({ children }: { children: React.ReactNode }) {
  useApiErrorHandler()
  return <>{children}</>
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <ErrorInterceptors>
        {children}
      </ErrorInterceptors>
    </GlobalErrorBoundary>
  )
}