/**
 * Search Commusoft for matching customers
 * Used during signup to find existing customer records
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SearchRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
}

interface CustomerCandidate {
  id: string;
  maskedName: string;
  maskedAddress: string;
  lastService: string | null;
  score: number;
}

serve(async (req) => {
  try {
    const { firstName, lastName, email, phone, postcode }: SearchRequest = await req.json();

    // TODO: Implement actual Commusoft API search
    // For now, return mock data for demonstration

    const mockCandidates: CustomerCandidate[] = [];

    // Simulate finding a match with 85% confidence
    if (firstName && lastName && postcode) {
      mockCandidates.push({
        id: `cust_${Date.now()}`,
        maskedName: `${firstName.charAt(0)}${'*'.repeat(firstName.length - 1)} ${lastName}`,
        maskedAddress: `${postcode.slice(0, 3)} ${'*'.repeat(postcode.length - 3)}`,
        lastService: 'Sept 2025',
        score: 85,
      });
    }

    return new Response(
      JSON.stringify({ candidates: mockCandidates }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
