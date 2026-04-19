// ============================================================================
// FILE: src/components/landing/landing-error-boundary.tsx
// PURPOSE: Error boundary for Landing Builder component
//
// Note: Class components can't call hooks, so the fallback UI is extracted
// into a child functional component (`DefaultErrorFallback`) that uses
// `useTranslations()` for i18n.
// ============================================================================

'use client';

import { Component, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// FALLBACK UI (functional — can use hooks)
// ============================================================================

function DefaultErrorFallback({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  const t = useTranslations('studio.errorBoundary');

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {t('title')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('description')}
            </p>
          </div>
          {process.env.NODE_ENV === 'development' && error && (
            <pre className="text-xs text-left bg-muted p-3 rounded-lg overflow-auto max-w-full">
              {error.message}
            </pre>
          )}
          <Button onClick={onRetry} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('retry')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ERROR BOUNDARY COMPONENT (class — can't use hooks)
// ============================================================================

export class LandingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LandingErrorBoundary] Error caught:', error);
    console.error('[LandingErrorBoundary] Error info:', errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}