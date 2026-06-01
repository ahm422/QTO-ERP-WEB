export type PricingPlan = {
  slug: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular: boolean;
  features: string[];
  cta: string;
};

export type PricingPlansType = PricingPlan[];
