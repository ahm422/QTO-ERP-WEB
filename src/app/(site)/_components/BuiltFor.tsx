import { HardHat, Building2, Briefcase } from 'lucide-react';
import { BuiltForSection } from '@/components/common/BuiltForSection';

export default function BuiltFor() {
  return (
    <BuiltForSection
      tag='Built for'
      title='Built for field &'
      accent='office'
      description='One platform for crews on site and teams coordinating from HQ — shared data, shared truth.'
      audiences={[
        {
          id: 'field',
          title: 'Field crews',
          description:
            'Attendance, tasks, and site readiness without spreadsheet chaos.',
          icon: HardHat,
        },
        {
          id: 'office',
          title: 'Office ops',
          description:
            'HR, inventory, and project controls that stay in sync with the field.',
          icon: Building2,
        },
        {
          id: 'finance',
          title: 'Controllers',
          description:
            'Labor and material visibility before costs overrun the bid.',
          icon: Briefcase,
        },
      ]}
    />
  );
}
