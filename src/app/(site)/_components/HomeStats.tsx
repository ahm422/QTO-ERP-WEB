'use client';

import StatsStrip from '@/components/common/Stats';
import { Building2, Smile, Star, Users } from 'lucide-react';

const stats = [
  { value: 10, suffix: 'K+', label: 'Active Users', icon: Users },
  { value: 4.9, suffix: '+', label: 'Average Rating', icon: Star },
  { value: 99, suffix: '%', label: 'Satisfaction', icon: Smile },
  { value: 150, suffix: '+', label: 'Companies', icon: Building2 },
];

export default function HomeStats() {
  return <StatsStrip stats={stats} />;
}
