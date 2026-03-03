export type PricingPlan = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular: boolean;
  features: string[];
  cta: string;
};

export type PricingPlansType = PricingPlan[];
