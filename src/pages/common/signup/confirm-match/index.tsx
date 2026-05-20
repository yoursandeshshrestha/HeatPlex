/**
 * Signup Step 3: Confirm Match
 * Match customer with existing Commusoft record or create new
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignupLayout } from '../components/SignupLayout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Check, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerCandidate {
  id: string;
  maskedName: string;
  maskedAddress: string;
  lastService: string | null;
  score: number;
}

export function SignupConfirmMatchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<CustomerCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Get form data from URL params
  const formData = {
    plan: searchParams.get('plan') || 'annual',
    firstName: searchParams.get('firstName') || '',
    lastName: searchParams.get('lastName') || '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    postcode: searchParams.get('postcode') || '',
  };

  useEffect(() => {
    searchCommusoftCustomers();
  }, []);

  async function searchCommusoftCustomers() {
    setLoading(true);
    try {
      // Call edge function to search for matching customers
      const { data, error } = await supabase.functions.invoke('search-customers', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          postcode: formData.postcode,
        },
      });

      if (error) {
        throw error;
      }

      const foundCandidates: CustomerCandidate[] = data?.candidates || [];

      // If high confidence match (score >= 80), auto-select and skip to payment
      if (foundCandidates.length === 1 && foundCandidates[0].score >= 80) {
        // Auto-match - proceed to payment
        const params = new URLSearchParams(searchParams);
        params.set('commusoftCustomerId', foundCandidates[0].id);
        navigate(`/join/payment?${params.toString()}`);
        return;
      }

      // If no candidates found, proceed to payment without match
      if (foundCandidates.length === 0) {
        navigate(`/join/payment?${searchParams.toString()}`);
        return;
      }

      setCandidates(foundCandidates);
    } catch (error) {
      console.error('Error searching customers:', error);
      // On error, proceed to payment without match (will create new customer)
      navigate(`/join/payment?${searchParams.toString()}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    setSubmitting(true);
    try {
      // Add selected customer ID to params
      const params = new URLSearchParams(searchParams);
      if (selectedCandidateId) {
        params.set('commusoftCustomerId', selectedCandidateId);
      }

      navigate(`/join/payment?${params.toString()}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingScreen message="Checking existing records..." />;
  }

  // If no candidates found, auto-proceed to payment
  // (This is handled in the useEffect above)

  return (
    <SignupLayout
      step="Step 3/4. Confirm identity"
      currentStep={3}
      totalSteps={4}
      leftContent={
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Is this you?
          </h2>
          <p className="text-muted-foreground">
            We found existing records that might match your details. Linking helps us provide better support.
          </p>
        </>
      }
    >
      <div className="space-y-6">

        {/* Info Alert */}
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            Linking your membership to existing service history helps us provide better support.
            We've masked some details for privacy.
          </AlertDescription>
        </Alert>

        {/* Candidates */}
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              className={`cursor-pointer transition-all hover:border-primary ${
                selectedCandidateId === candidate.id ? 'border-primary border-2 shadow-lg' : ''
              }`}
              onClick={() => setSelectedCandidateId(candidate.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{candidate.maskedName}</CardTitle>
                    <CardDescription>
                      {candidate.maskedAddress}
                      {candidate.lastService && ` · Last service: ${candidate.lastService}`}
                    </CardDescription>
                  </div>
                  {selectedCandidateId === candidate.id && (
                    <div className="flex items-center justify-center size-6 rounded-full bg-primary shrink-0">
                      <Check className="size-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}

          {/* None of these option */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedCandidateId === 'new' ? 'border-primary border-2 shadow-lg' : ''
            }`}
            onClick={() => setSelectedCandidateId('new')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">None of these</CardTitle>
                  <CardDescription>
                    Create a new customer record
                  </CardDescription>
                </div>
                {selectedCandidateId === 'new' && (
                  <div className="flex items-center justify-center size-6 rounded-full bg-primary shrink-0">
                    <Check className="size-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="cursor-pointer"
          >
            ← Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedCandidateId || submitting}
            className="cursor-pointer px-8"
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              'Continue →'
            )}
          </Button>
        </div>
      </div>
    </SignupLayout>
  );
}
