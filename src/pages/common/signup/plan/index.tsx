/**
 * Signup Step 1: Choose Plan
 * Select between annual £199 or monthly £19.99 membership
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignupLayout } from '../components/SignupLayout';
import { PlanCard } from '../components/PlanCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

type Plan = 'annual' | 'monthly';

const BENEFITS = [
  '20% off all works',
  'Free annual boiler service',
  'Free Gas Safety Certificate (CP12)',
  'Members book service slots first',
];

export function SignupPlanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    (searchParams.get('plan') as Plan) || 'annual'
  );

  function handleContinue() {
    // Store plan in URL params for next step
    navigate(`/join/details?plan=${selectedPlan}`);
  }

  return (
    <SignupLayout
      step="Step 1/3. Choose plan"
      currentStep={1}
      totalSteps={3}
      leftContent={
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Choose your membership plan
          </h2>
          <p className="text-muted-foreground">
            Join Heat Plex Membership and enjoy priority service with year-round savings
          </p>
        </>
      }
    >
      <div className="space-y-10">
        {/* Plan Selection */}
        <div className="grid grid-cols-2 gap-6 pt-6 items-start">
          <PlanCard
            type="annual"
            selected={selectedPlan === 'annual'}
            onSelect={() => setSelectedPlan('annual')}
          />
          <PlanCard
            type="monthly"
            selected={selectedPlan === 'monthly'}
            onSelect={() => setSelectedPlan('monthly')}
          />
        </div>

        {/* Benefits */}
        <Card className="bg-muted/30">
          <CardContent>
            <h3 className="text-lg font-semibold mb-6">What's included</h3>
            <div className="grid grid-cols-2 gap-4">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 shrink-0 mt-0.5">
                    <Check className="size-3 text-primary" />
                  </div>
                  <span className="text-sm leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            Back to login
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="cursor-pointer px-10 py-6 text-base"
            size="lg"
          >
            Continue →
          </Button>
        </div>
      </div>
    </SignupLayout>
  );
}
