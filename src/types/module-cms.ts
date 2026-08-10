/** CMS types for ERP module capabilities + rollout pipeline. */

export type ModuleCapability = {
  iconKey?: string;
  title: string;
  description: string;
  href?: string;
};

export type ModuleCapabilitiesType = ModuleCapability[];

export type ModuleRolloutStep = {
  step: number;
  title: string;
  description: string;
  iconKey: string;
};

export type ModuleRolloutStepsType = ModuleRolloutStep[];

export type ModuleRolloutSection = {
  tag: string;
  titleTemplate: string;
  description: string;
  steps: ModuleRolloutStepsType;
};
