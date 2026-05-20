/**
 * Plan Card Component
 * Displays annual or monthly membership plan
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PlanCardProps {
  type: 'annual' | 'monthly';
  selected: boolean;
  onSelect: () => void;
}

export function PlanCard({ type, selected, onSelect }: PlanCardProps) {
  const isAnnual = type === 'annual';

  return (
    <Card
      className={`relative cursor-pointer transition-all border-2 overflow-visible h-full ${
        selected
          ? 'border-primary shadow-lg'
          : 'border-transparent hover:border-muted-foreground/30'
      }`}
      onClick={onSelect}
    >
      {/* Save Badge */}
      {isAnnual && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
          <Badge className="bg-green-600 text-white hover:bg-green-600 px-3 py-1 whitespace-nowrap">
            Save £40
          </Badge>
        </div>
      )}

      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center justify-center size-6 rounded-full bg-primary">
            <Check className="size-4 text-primary-foreground" />
          </div>
        </div>
      )}

      <CardHeader className={`text-center pb-4 ${isAnnual ? 'pt-6' : 'pt-6'}`}>
        <CardTitle className="text-xl mb-3">
          {isAnnual ? 'Annual' : 'Monthly'}
        </CardTitle>
        <div className="mt-4 mb-3">
          <div className="text-5xl font-bold tracking-tight">
            £{isAnnual ? '199' : '19.99'}
          </div>
          <div className="text-muted-foreground mt-1">
            /{isAnnual ? 'year' : 'month'}
          </div>
        </div>
        {!isAnnual && (
          <CardDescription className="text-sm mt-2">
            12-month minimum term
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="text-center space-y-3 pb-6">
        {isAnnual ? (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              One payment, full year coverage
            </p>
            <p className="text-sm font-medium text-primary">
              Equivalent to £16.58/month
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Spread the cost monthly
            </p>
            <p className="text-sm text-muted-foreground">
              Total: £239.88/year
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
