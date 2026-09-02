export type Problem = {
  problem: string;
  solution: string;
  /** Optional CMS icon key (see `src/lib/cms-icons.ts`); falls back to a neutral alert glyph. */
  iconKey?: string;
};

export type ProblemsType = Problem[];
