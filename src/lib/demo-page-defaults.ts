import type { DemoFormFieldOptions, DemoIconStep } from "@/db/schema";

export const DEMO_PAGE_CONTENT_ID = "default" as const;

export type DemoPageContentDefault = {
  id: string;
  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroBadges: string[];
  processTag: string;
  processTitle: string;
  processDescription: string;
  whatToExpect: DemoIconStep[];
  sideTitle: string;
  sideDescription: string;
  benefits: DemoIconStep[];
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  formFieldOptions: DemoFormFieldOptions;
};

export const DEMO_PAGE_CONTENT_DEFAULTS: DemoPageContentDefault = {
  id: DEMO_PAGE_CONTENT_ID,
  heroBadge: "Book a Demo",
  heroTitle: "Experience QTO-ERP",
  heroAccent: "Your Way",
  heroDescription:
    "Get a personalized walkthrough of how QTO-ERP can streamline your operations, boost productivity, and transform your business.",
  heroBadges: ["No credit card required", "15 minutes to book"],
  processTag: "Process",
  processTitle: "What to Expect",
  processDescription:
    "Our demo process is designed to give you maximum value and insight",
  whatToExpect: [
    {
      iconKey: "clock",
      title: "30-Minute Session",
      description:
        "Tailored demonstration focused on your specific business needs and challenges",
    },
    {
      iconKey: "users",
      title: "Expert Team",
      description:
        "Connect with our product specialists who understand your industry",
    },
    {
      iconKey: "zap",
      title: "Live Demo",
      description: "See real-time workflows and integrations in action",
    },
    {
      iconKey: "check-circle-2",
      title: "Next Steps",
      description:
        "Custom implementation roadmap tailored to your organization",
    },
  ],
  sideTitle: "See QTO-ERP in Action",
  sideDescription:
    "Get a personalized walkthrough of features designed to transform your operations.",
  benefits: [
    {
      iconKey: "zap",
      title: "30-minute demo",
      description: "Tailored to your needs",
    },
    {
      iconKey: "users",
      title: "Expert guidance",
      description: "From our product team",
    },
    {
      iconKey: "target",
      title: "Custom insights",
      description: "For your industry",
    },
  ],
  testimonialQuote:
    "This demo helped us understand exactly how to streamline our HR workflows. Game changer!",
  testimonialAuthor: "Sarah Chen",
  testimonialRole: "Operations Manager, TechFlow Inc",
  formFieldOptions: {
    labels: {
      name: "Full Name",
      email: "Email Address",
      phone: "Client Contact Number",
      companyPhone: "Company Contact Number",
      country: "Country",
      company: "Company Name",
      businessType: "Business Type",
    },
    placeholders: {
      name: "John Doe",
      email: "john@company.com",
      phone: "+1 (555) 123-4567",
      companyPhone: "+1 (555) 123-4567",
      company: "Acme Corporation",
      country: "Select a country",
      businessType: "Select business type",
    },
    countries: [
      "United States",
      "Canada",
      "United Kingdom",
      "Australia",
      "India",
      "Germany",
      "France",
      "Japan",
      "China",
      "Brazil",
      "Mexico",
      "UAE",
      "Singapore",
      "Other",
    ],
    businessTypes: [
      { value: "startup", label: "Startup" },
      { value: "smb", label: "Small & Medium Business" },
      { value: "enterprise", label: "Enterprise" },
      { value: "non-profit", label: "Non-Profit" },
      { value: "government", label: "Government" },
      { value: "other", label: "Other" },
    ],
    successMessage:
      "Thank you! We will contact you soon to schedule your demo.",
    submitLabel: "Request Demo",
  },
};
