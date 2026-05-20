/**
 * Consistent loading screen used across the app
 */

import { Spinner } from './spinner';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = 'Loading...',
  fullScreen = true
}: LoadingScreenProps) {
  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Spinner className="h-8 w-8 text-primary mx-auto" />
        {message && (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
