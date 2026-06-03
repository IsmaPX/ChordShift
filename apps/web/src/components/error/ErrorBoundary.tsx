import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMessage = [
      `Error: ${error.message}`,
      `Stack: ${error.stack}`,
      `Component Stack: ${errorInfo.componentStack}`,
    ].join('\n')

    console.error('[ErrorBoundary]', errorMessage)

    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-8">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Algo salió mal
        </h2>
        <p className="text-text-secondary mb-6 text-sm">
          {error?.message || 'Ha ocurrido un error inesperado'}
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium"
        >
          <RefreshCw size={18} />
          Reintentar
        </button>
      </div>
    </div>
  )
}