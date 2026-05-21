/**
 * Member Services Page
 * View and book services
 */

import { ServicesTab } from '../components/ServicesTab';

export function MemberServicesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground mt-1">
          Book and manage your service appointments
        </p>
      </div>

      <ServicesTab />
    </div>
  );
}
