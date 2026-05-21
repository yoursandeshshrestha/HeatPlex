/**
 * Services Tab
 * Book services and view history
 */

import { Button } from '@/components/ui/button';
import { Calendar, Phone } from 'lucide-react';
import { PanelEmpty, SectionPanel, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from './member-ui';

const serviceTypes = [
  {
    title: 'Annual boiler service',
    detail: 'Free for members · Worth £120',
  },
  {
    title: 'Gas Safety Certificate (CP12)',
    detail: 'Free for members · Worth £80',
  },
  {
    title: 'Boiler repairs',
    detail: '20% member discount',
  },
  {
    title: 'Emergency callout',
    detail: '20% member discount · 24/7',
  },
];

export function ServicesTab() {
  return (
    <div className="space-y-8">
      <SectionPanel title="Book a Service">
        <p className="text-sm text-muted-foreground">
          Schedule your annual boiler service or request a repair.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button disabled className="cursor-not-allowed">
            <Calendar className="mr-2 size-4" />
            Book service (coming soon)
          </Button>
          <Button variant="outline" className="cursor-pointer" asChild>
            <a href={`tel:${SUPPORT_PHONE}`}>
              <Phone className="mr-2 size-4" />
              Call {SUPPORT_PHONE_DISPLAY}
            </a>
          </Button>
        </div>
      </SectionPanel>

      <SectionPanel title="Available Services" flushList>
        <ul className="-mx-6 divide-y divide-border">
          {serviceTypes.map((service) => (
            <li key={service.title} className="px-6 py-3.5 first:pt-0 last:pb-0">
              <p className="text-sm font-medium">{service.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{service.detail}</p>
            </li>
          ))}
        </ul>
      </SectionPanel>

      <SectionPanel title="Upcoming Bookings" flushList>
        <PanelEmpty
          flush
          message="No upcoming bookings"
          hint="Book your free annual boiler service when online booking is available"
        />
      </SectionPanel>

      <SectionPanel title="Service History" flushList>
        <PanelEmpty
          flush
          message="No service history yet"
          hint="Completed visits will appear here"
        />
      </SectionPanel>

      <SectionPanel title="Need Help?">
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Office hours</p>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="mt-0.5 block text-muted-foreground hover:text-foreground"
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">Monday–Friday, 8am–6pm</p>
          </div>
          <p className="text-xs text-muted-foreground">
            For urgent out-of-hours issues, call the number above and follow the prompts.
          </p>
        </div>
      </SectionPanel>
    </div>
  );
}
