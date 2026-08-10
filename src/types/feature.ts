export type Feature = {
  title: string;
  description: string;
  icon: string;
  /** R2 object key under module-images/ (stored in DB). */
  imageKey?: string;
  /** Public URL resolved via mediaUrl() in serializers (not stored). */
  imageUrl?: string;
};

export type FeaturesType = Feature[];
