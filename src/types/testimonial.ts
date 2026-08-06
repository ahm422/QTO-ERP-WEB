export type TestimonialType = {
  content: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  rating?: number;
  /** Solution / module tag shown on the quote card (e.g. "Attendance"). */
  selectedSolution?: string;
  /**
   * Optional verification-style chip. Leave unset until approved copy exists
   * (do not invent dollar / “Verified” claims).
   */
  badge?: string;
};

export type TestimonialsType = TestimonialType[];
