export const CONTACT_SUPPORT_CONTENT_ID = "default" as const;
export const CONTACT_PAGE_CONTENT_ID = "default" as const;

export type ContactSupportCard = {
  iconKey: string;
  title: string;
  description: string;
};

export type ContactResponseTimes = {
  typical: string;
  priority: string;
};

export type ContactSupportContentDefault = {
  id: string;
  tag: string;
  title: string;
  description: string;
  knowledgeBaseLabel: string;
  knowledgeBaseHref: string;
  cards: ContactSupportCard[];
  responseTimes: ContactResponseTimes;
};

export type ContactFormFieldOptions = {
  labels: {
    name: string;
    email: string;
    phone: string;
    company: string;
    companySize: string;
    subject: string;
    message: string;
  };
  placeholders: {
    name: string;
    email: string;
    phone: string;
    company: string;
    companySize: string;
    subject: string;
    message: string;
  };
  companySizes: Array<{ value: string; label: string }>;
  subjects: Array<{ value: string; label: string }>;
  submitLabel?: string;
  successMessage?: string;
};

export type ContactPageContentDefault = {
  id: string;
  sideTitle: string;
  sideDescription: string;
  formFieldOptions: ContactFormFieldOptions;
  faqTag: string;
  faqTitle: string;
  faqDescription: string;
  metaTitle: string;
  metaDescription: string;
};

export type ContactChannelDefault = {
  type: string;
  label: string;
  value: string;
  iconKey: string;
  sortOrder: number;
  published: boolean;
};

export const CONTACT_SUPPORT_CONTENT_DEFAULTS: ContactSupportContentDefault = {
  id: CONTACT_SUPPORT_CONTENT_ID,
  tag: "Support",
  title: "How We Support You",
  description:
    "We're committed to providing world-class support across every channel, whenever you need us most",
  knowledgeBaseLabel: "Visit Knowledge Base",
  knowledgeBaseHref: "/blog",
  cards: [
    {
      iconKey: "clock",
      title: "Quick Response",
      description: "Get answers within 2 hours during business hours",
    },
    {
      iconKey: "shield",
      title: "Secure & Private",
      description:
        "Your information is protected with enterprise-grade security",
    },
    {
      iconKey: "message-circle",
      title: "Multiple Channels",
      description: "Reach us via email, phone, chat, or contact form",
    },
    {
      iconKey: "zap",
      title: "Expert Support",
      description: "Connect with our knowledgeable support specialists",
    },
  ],
  responseTimes: {
    typical: "2-4 hours",
    priority: "Within 1 hour",
  },
};

export const CONTACT_PAGE_CONTENT_DEFAULTS: ContactPageContentDefault = {
  id: CONTACT_PAGE_CONTENT_ID,
  sideTitle: "We're Here To Help",
  sideDescription:
    "Questions? Issues? Ideas? Send us a message and our dedicated support team will get back to you as soon as possible.",
  formFieldOptions: {
    labels: {
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      company: "Company Name",
      companySize: "Company Size",
      subject: "Subject",
      message: "Message",
    },
    placeholders: {
      name: "John Doe",
      email: "john@company.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Corporation",
      companySize: "Select company size",
      subject: "Select a subject",
      message: "Tell us how we can help…",
    },
    companySizes: [
      { value: "1-10", label: "1-10 Employees" },
      { value: "11-50", label: "11-50 Employees" },
      { value: "51-200", label: "51-200 Employees" },
      { value: "201-500", label: "201-500 Employees" },
      { value: "501-1000", label: "501-1000 Employees" },
      { value: "1000+", label: "1000+ Employees" },
    ],
    subjects: [
      { value: "general", label: "General Inquiry" },
      { value: "sales", label: "Sales Inquiry" },
      { value: "support", label: "Technical Support" },
      { value: "partnership", label: "Partnership Opportunity" },
      { value: "feedback", label: "Feedback" },
      { value: "other", label: "Other" },
    ],
    submitLabel: "Send Message",
    successMessage:
      "Thank you for reaching out! We will get back to you shortly.",
  },
  faqTag: "FAQ",
  faqTitle: "Quick Support Guide",
  faqDescription:
    "Find quick answers to common questions. For more help, our support team is just one message away.",
  metaTitle: "Contact Us",
  metaDescription:
    "Get in touch with our ERPSuite team. We're here to answer your questions and help with your business needs.",
};

/** Side-panel + bottom cards share this source of truth. */
export const CONTACT_CHANNELS_DEFAULTS: ContactChannelDefault[] = [
  {
    type: "email",
    label: "Email Support",
    value: "support@erpqto.com",
    iconKey: "mail",
    sortOrder: 0,
    published: true,
  },
  {
    type: "email",
    label: "Sales Email",
    value: "sales@erpqto.com",
    iconKey: "mail",
    sortOrder: 1,
    published: true,
  },
  {
    type: "phone",
    label: "Phone Support",
    value: "+1 (800) 123-4567",
    iconKey: "phone",
    sortOrder: 2,
    published: true,
  },
  {
    type: "phone",
    label: "Sales Phone",
    value: "+1 (800) 987-6543",
    iconKey: "phone",
    sortOrder: 3,
    published: true,
  },
  {
    type: "chat",
    label: "Live Chat",
    value: "Real-time assistance",
    iconKey: "message-circle",
    sortOrder: 4,
    published: true,
  },
  {
    type: "office",
    label: "Office",
    value: "123 Business St, New York, NY 10001",
    iconKey: "building-2",
    sortOrder: 5,
    published: true,
  },
];

export const DEFAULT_MODULE_ROLLOUT_STEPS = [
  {
    step: 1,
    title: "Discover fit",
    description:
      "Map workflows and success criteria so the rollout matches how your teams already work.",
    iconKey: "clipboard-check",
  },
  {
    step: 2,
    title: "Configure",
    description:
      "Turn on roles, fields, and integrations — no custom code required for the common path.",
    iconKey: "settings-2",
  },
  {
    step: 3,
    title: "Deploy",
    description:
      "Pilot with a site or department, then expand with shared templates and training.",
    iconKey: "rocket",
  },
  {
    step: 4,
    title: "Optimize",
    description:
      "Use live dashboards and audits to tighten cycle time and keep compliance ready.",
    iconKey: "line-chart",
  },
] as const;

export const DEFAULT_MODULE_ROLLOUT_SECTION = {
  tag: "Pipeline",
  titleTemplate: "How {name} rolls out",
  description:
    "A four-step path from shortlist to live operations — same DNA across every module.",
} as const;
