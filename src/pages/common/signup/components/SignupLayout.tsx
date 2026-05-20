/**
 * Signup Layout
 * Shared layout wrapper for all signup wizard steps
 * 30% left sidebar / 70% right content split
 */

import type { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';

interface SignupLayoutProps {
  children: ReactNode;
  leftContent: ReactNode;
  step?: string;
  currentStep?: number;
  totalSteps?: number;
}

export function SignupLayout({ children, leftContent, step, currentStep, totalSteps }: SignupLayoutProps) {
  return (
    <>
      {/* Progress Bar at Top */}
      {currentStep && totalSteps && (
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      )}

      <div className="h-screen flex overflow-hidden">
        {/* Left Sidebar - 30% Fixed */}
        <div className="w-[30%] border-r bg-muted/30 p-8 flex flex-col overflow-hidden">
          {step && (
            <div className="text-sm text-muted-foreground mb-6">{step}</div>
          )}
          <div className="flex-1 flex items-center">
            <div className="space-y-4">
              {leftContent}
            </div>
          </div>
        </div>

        {/* Right Content - 70% Scrollable */}
        <div className="w-[70%] overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-8 py-12">
            <div className="w-full max-w-2xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
