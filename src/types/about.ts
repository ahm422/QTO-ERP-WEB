export type AboutStatType = {
  label: string;
  value: string;
};

export type AboutContentType = {
  id: number;
  tag: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  stats?: AboutStatType[];
};

export type AboutContentsType = AboutContentType[];
