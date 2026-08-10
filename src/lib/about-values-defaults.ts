export type AboutValueDefault = {
  title: string;
  description: string;
  sortOrder: number;
  published: boolean;
};

export const ABOUT_VALUES_DEFAULTS: AboutValueDefault[] = [
  {
    title: "Simplicity First",
    description:
      "Complex problems deserve simple solutions. We cut the clutter so you can focus.",
    sortOrder: 0,
    published: true,
  },
  {
    title: "Built to Scale",
    description:
      "Whether you're 10 or 10,000 people, QTO-ERP grows with your organization.",
    sortOrder: 1,
    published: true,
  },
  {
    title: "Customer Obsessed",
    description:
      "Every feature starts with a real customer problem. We listen, build, and iterate.",
    sortOrder: 2,
    published: true,
  },
];
