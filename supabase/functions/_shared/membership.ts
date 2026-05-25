/** Membership date helpers shared by edge functions. */

export function getRenewalDate(plan: 'annual' | 'monthly', start = new Date()) {
  const renewal = new Date(start);
  if (plan === 'annual') {
    renewal.setFullYear(renewal.getFullYear() + 1);
  } else {
    renewal.setMonth(renewal.getMonth() + 1);
  }
  return renewal.toISOString().slice(0, 10);
}

export function activationDates(plan: 'annual' | 'monthly', at = new Date()) {
  return {
    started_at: at.toISOString(),
    renewal_date: getRenewalDate(plan, at),
  };
}
