'use client'

import { useState, useCallback, useEffect } from 'react'
import { AlertTriangle, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

interface ErrorInfo {
  message: string
  detail?: string
  timestamp: string
  url: string
  stack?: string
  statusCode?: number
}

export function ErrorDisplay({ error, reset, statusCode }: {
  error: Error & { digest?: string }
  reset?: () => void
  statusCode?: number
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const errorInfo: ErrorInfo = {
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    statusCode,
    stack: error.stack,
    detail: (error as any).detail || (error as any).info,
  }

  const copyText = useCallback(() => {
    const lines = [
      `=== Lumil of Beauty Error Report ===`,
      `Time: ${errorInfo.timestamp}`,
      `URL: ${errorInfo.url}`,
      `Status: ${errorInfo.statusCode || 'N/A'}`,
      `Message: ${errorInfo.message}`,
      errorInfo.detail ? `Detail: ${errorInfo.detail}` : '',
      error.digest ? `Digest: ${error.digest}` : '',
      '',
      'Stack Trace:',
      errorInfo.stack || 'No stack trace available',
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }, [errorInfo])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {statusCode === 404 ? 'Page Not Found' : 'Something Went Wrong'}
            </h1>
            <p className="text-red-100 text-sm mt-1">
              {statusCode === 404
                ? 'The page you are looking for does not exist.'
                : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>

          {/* Error message */}
          <div className="p-6 space-y-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-sm font-medium text-red-800 break-words">
                {errorInfo.message}
              </p>
              {errorInfo.detail && (
                <p className="text-xs text-red-600 mt-2 break-words">{errorInfo.detail}</p>
              )}
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-400 space-y-1 bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-mono text-gray-500">{errorInfo.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>URL</span>
                <span className="font-mono text-gray-500 truncate max-w-[250px]">{errorInfo.url}</span>
              </div>
              {errorInfo.statusCode && (
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-mono text-gray-500">{errorInfo.statusCode}</span>
                </div>
              )}
              {error.digest && (
                <div className="flex justify-between">
                  <span>Error Digest</span>
                  <span className="font-mono text-gray-500">{error.digest}</span>
                </div>
              )}
            </div>

            {/* Expandable stack trace */}
            {errorInfo.stack && (
              <div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expanded ? 'Hide' : 'Show'} Technical Details
                </button>
                {expanded && (
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto max-h-64 overflow-y-auto font-mono leading-relaxed">
                    {errorInfo.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={copyText}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
              >
                {copied ? (
                  <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Error Details</>
                )}
              </button>
              {reset && (
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 transition-colors shadow-md"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              )}
              {!reset && (
                <a
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 transition-colors shadow-md text-center"
                >
                  Go Home
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Global fetch error interceptor — shows a toast for API errors */
export function useApiErrorHandler() {
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const res = await originalFetch(...args)
        if (!res.ok) {
          const cloned = res.clone()
          try {
            const json = await cloned.json()
            if (json.error && !json.success) {
              showErrorToast(json.error, res.status, args[0]?.toString?.() || '')
            }
          } catch {}
        }
        return res
      } catch (err: any) {
        showErrorToast(err.message || 'Network error', 0, args[0]?.toString?.() || '')
        throw err
      }
    }
    return () => { window.fetch = originalFetch }
  }, [])
}

function showErrorToast(message: string, status: number, url: string) {
  // Remove existing toast if any
  const existing = document.getElementById('global-error-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'global-error-toast'
  toast.innerHTML = `
    <div style="
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      max-width: 420px; background: white; border: 1px solid #fecaca;
      border-radius: 16px; padding: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      font-family: system-ui, sans-serif;
    ">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 10px; background: #fef2f2; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div style="flex: 1; min-width: 0;">
          <p style="font-size: 13px; font-weight: 600; color: #991b1b; margin: 0;">${status ? `Error ${status}` : 'Network Error'}</p>
          <p id="toast-msg" style="font-size: 12px; color: #6b7280; margin: 4px 0 0; word-break: break-word;">${message}</p>
          ${url ? `<p style="font-size: 11px; color: #9ca3af; margin: 6px 0 0; font-family: monospace;">${url}</p>` : ''}
          <button onclick="navigator.clipboard.writeText(this.parentElement.querySelector('#toast-msg').textContent + '\\nURL: ${url}\\nStatus: ${status}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy Details', 2000);"
            style="margin-top: 8px; font-size: 11px; color: #ec4899; background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
            Copy Details
          </button>
        </div>
        <button onclick="this.closest('#global-error-toast').remove()" style="background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0; font-size: 16px; line-height: 1;">&times;</button>
      </div>
    </div>
  `
  document.body.appendChild(toast)
  setTimeout(() => { toast.style.transition = 'opacity 0.3s'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }, 8000)
}