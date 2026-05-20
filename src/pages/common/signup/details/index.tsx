/**
 * Signup Step 2: Your Details
 * Collect personal information and service address
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignupLayout } from '../components/SignupLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  town: string;
  postcode: string;
  promoCode: string;
  marketingOptIn: boolean;
  termsAccepted: boolean;
}

export function SignupDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'annual';
  const engineerParam = searchParams.get('engineer');

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    town: '',
    postcode: '',
    promoCode: engineerParam || '',
    marketingOptIn: false,
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no plan selected
  useEffect(() => {
    if (!plan) {
      navigate('/join/plan');
    }
  }, [plan, navigate]);

  function handleChange(field: keyof FormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions to continue');
      return;
    }

    setLoading(true);

    try {
      // Navigate to next step with form data in URL params
      const params = new URLSearchParams({
        plan,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        town: formData.town,
        postcode: formData.postcode,
        promoCode: formData.promoCode,
        marketingOptIn: formData.marketingOptIn.toString(),
        termsAccepted: formData.termsAccepted.toString(),
      });

      // Skip confirm-match and go directly to payment
      navigate(`/join/payment?${params.toString()}`);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupLayout
      step="Step 2/3. Your details"
      currentStep={2}
      totalSteps={3}
      leftContent={
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Tell us about yourself
          </h2>
          <p className="text-muted-foreground">
            We need your details and service address to set up your membership
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    disabled={loading}
                    className="cursor-text h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    disabled={loading}
                    className="cursor-text h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={loading}
                  className="cursor-text h-11"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobile phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  disabled={loading}
                  className="cursor-text h-11"
                  placeholder="07XXX XXXXXX"
                />
              </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Service Address</h3>
          <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  required
                  disabled={loading}
                  className="cursor-text h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleChange('addressLine2', e.target.value)}
                  disabled={loading}
                  className="cursor-text h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="town">Town/City *</Label>
                  <Input
                    id="town"
                    value={formData.town}
                    onChange={(e) => handleChange('town', e.target.value)}
                    required
                    disabled={loading}
                    className="cursor-text h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleChange('postcode', e.target.value.toUpperCase())}
                    required
                    disabled={loading}
                    className="cursor-text h-11"
                    placeholder="SW8 3PG"
                  />
                </div>
              </div>
          </div>
        </div>

        <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo / Engineer code (optional)</Label>
                <Input
                  id="promoCode"
                  value={formData.promoCode}
                  onChange={(e) => handleChange('promoCode', e.target.value)}
                  disabled={loading}
                  className="cursor-text h-11"
                  placeholder="e.g., VAS, MARINEL"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketingOptIn"
                  checked={formData.marketingOptIn}
                  onCheckedChange={(checked) => handleChange('marketingOptIn', checked as boolean)}
                  disabled={loading}
                  className="cursor-pointer mt-1"
                />
                <Label htmlFor="marketingOptIn" className="text-sm font-normal cursor-pointer">
                  Send me tips, offers, and updates about Heat Plex services (you can unsubscribe anytime)
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleChange('termsAccepted', checked as boolean)}
                  disabled={loading}
                  className="cursor-pointer mt-1"
                />
                <Label htmlFor="termsAccepted" className="text-sm font-normal cursor-pointer">
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-primary hover:underline cursor-pointer">
                    terms and conditions
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" className="text-primary hover:underline cursor-pointer">
                    privacy policy
                  </a>
                  {' '}*
                </Label>
              </div>
        </div>

        {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/join/plan?plan=${plan}`)}
            disabled={loading}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.termsAccepted}
            className="cursor-pointer px-10 py-6 text-base"
            size="lg"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              'Continue →'
            )}
          </Button>
        </div>
      </form>
    </SignupLayout>
  );
}
