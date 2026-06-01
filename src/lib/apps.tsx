import { PlatformsType } from "@/types";
import {
  Clock,
  Users,
  FolderKanban,
  Building2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
export const apps: PlatformsType = [
  {
    slug: "attendance",
    name: "Attendance",
    image: "/assets/images/attendance.png",
    shortDescription: "Track check-ins, check-outs work hours in real time.",
    highlights: [
      "Real-time clock in/out",
      "Shift scheduling",
      "Automated timesheets",
      "Saves Time",
      "Reduces Errors",
      "Builds Trust",
      "Stays Compliant",
      "Integrates Easily",
      "Secure and Reliable",
    ],
    bestFor: "Perfect for teams in Lahore or anywhere in Pakistan",
    cardTagline: "Smart time tracking and leave management for modern teams.",
    icon: Clock,
    videoUrl: "#",
    videoCtaTitle: "See Attendance in Action",
    videoCtaDescription:
      "Discover how our Attendance module simplifies time tracking, leave management, and overtime control — all in one seamless workflow.",
    heroHeadline: "Welcome to QTO ERP Attendance Module",
    heroSubheadline:
      "Automate timesheets, manage shifts, and track attendance in real time — all from one dashboard.",
    aboutTitle:
      "Effortless attendance tracking. Manage hours, shifts, and leave with real-time insights — all in one secure system.",
    aboutDescription: [],
    aboutContents: [
      {
        id: 1,
        tag: "Overview",
        title: "Effortless Attendance Management for Every Organization",
        description:
          "QTO Attendance simplifies tracking of employee hours, shifts, and leave requests. Employees can check in and out with a single click, while managers get real-time insights into attendance patterns and productivity. The system ensures accuracy, compliance, and seamless workflow management.",
        image: "/assets/images/attendance.png",
        imageAlt: "Attendance - Overview",
      },
      {
        id: 2,
        tag: "Problem",
        title: "Traditional Attendance Systems Waste Time and Cause Errors",
        description:
          "Manual time tracking and paper-based processes create inefficiencies, delays in approvals, and errors in payroll calculations. Managers and HR teams spend excessive time chasing attendance updates instead of focusing on strategic tasks.",
        image: "/assets/images/attendance.png",
        imageAlt: "Attendance - Problem",
      },
      {
        id: 3,
        tag: "Solution",
        title: "Smart, Automated, and Secure Attendance",
        description:
          "QTO Attendance digitizes all attendance workflows. Employees can clock in/out from any device, submit correction requests, and apply for leave digitally. Managers receive instant dashboards, while HR teams save hours with automated reports. All records are secure, backed up daily, and accessible anytime.",
        image: "/assets/images/attendance.png",
        imageAlt: "Attendance - Solution",
      },
    ],
    features: [
      {
        title: "Smart Check-In & Check-Out",
        description:
          "Record work hours from any device with one action. The system captures accurate in/out times and automatically calculates total working hours. Support grace periods and validation against schedules. Works on mobile and web for office and remote workers.",
        icon: "clock",
      },
      {
        title: "Intelligent Break Tracking",
        description:
          "Monitor break durations in one place. Employees start and end breaks with simple actions; break time is automatically deducted from total hours so daily and monthly timesheets stay accurate and compliant. Prevent overlapping breaks and keep a clear audit of break time.",
        icon: "calendar",
      },
      {
        title: "Automated Time Calculations",
        description:
          "Generate precise daily and monthly timesheets without manual entry. Working hours, overtime, and exceptions are calculated automatically. Reduce errors and save time for payroll and reporting.",
        icon: "pause",
      },
      {
        title: "Digital Leave Management",
        description:
          "Submit, approve, and track leave through structured workflows. Leave balances update in real time for full transparency. Support different leave types (e.g. sick, annual), manager approvals with comments and notifications, and advance-notice or emergency leave where needed.",
        icon: "calendar-off",
      },
      {
        title: "Overtime & Undertime Control",
        description:
          "Automatically calculate extra hours and short hours based on company policies. Ensure fair compensation and accurate payroll. Support configurable rules and clear reporting of overtime and undertime.",
        icon: "alert-triangle",
      },
      {
        title: "Attendance Adjustments",
        description:
          "Let employees request corrections for missed or incorrect clock-in/out entries. Managers review and approve changes with a full audit trail. Keep records accurate while tracking who changed what and when.",
        icon: "edit",
      },
    ],
    problems: [
      {
        problem: "Messy attendance sheets and forgotten clock-ins",
        solution:
          "One-click digital check-ins eliminate paper sheets and manual tracking.",
      },
      {
        problem: "Payroll errors from manual timesheet entry",
        solution:
          "Automated timesheets sync directly with payroll, removing human error.",
      },
      {
        problem: "No visibility into team availability",
        solution:
          "Real-time dashboards show who's in, who's late, and who's on leave.",
      },
    ],
    useCases: [
      {
        title: "Construction Crews",
        description:
          "Track on-site attendance across multiple job sites with GPS verification.",
        audience: "Field managers",
      },
      {
        title: "Remote Teams",
        description:
          "Let distributed employees clock in from anywhere with location verification.",
        audience: "Remote-first companies",
      },
      {
        title: "Retail & Hospitality",
        description: "Manage rotating shifts and seasonal staffing with ease.",
        audience: "Store managers",
      },
    ],
    testimonials: [
      {
        content:
          "We cut payroll processing time by 60% after switching to this attendance system.",
        name: "Sarah Chen",
        role: "HR Director",
        company: "TechFlow Inc.",
      },
      {
        content:
          "No more arguments about hours worked. Everything is tracked transparently.",
        name: "James Miller",
        role: "Operations Lead",
        company: "BuildRight Co.",
      },
    ],
    faqs: [
      {
        question: "Can employees clock in from their mobile devices?",
        answer:
          "Yes. Employees can securely clock in and clock out using their smartphones. The system supports GPS-based verification to ensure accurate and location-aware attendance tracking.",
      },
      {
        question: "Does it integrate with payroll software?",
        answer:
          "Yes. The Attendance module integrates with payroll systems and supports secure data export via CSV and API to ensure seamless payroll processing.",
      },
      {
        question: "How does the system handle overtime?",
        answer:
          "You can define custom overtime rules based on your company policies. The system automatically calculates and highlights overtime hours for accurate compensation and reporting.",
      },
    ],
  },
  {
    slug: "hrm",
    name: "HRM",
    shortDescription:
      "Centralize employee data, onboarding, performance .",
    highlights: [
      "Employee database",
      "Onboarding workflows",
      "Performance reviews",
    ],
    bestFor: "HR departments managing 50+ employees",
    cardTagline: "Complete human resource management for growing organizations.",
    icon: Users,
    videoUrl: "#",
    heroHeadline: "Human Resource Management, Simplified",
    heroSubheadline:
      "From hiring to retirement, manage your entire employee lifecycle in one unified platform.",
    aboutTitle: "About HRM",
    aboutDescription: [
      `Our HRM module serves as a centralized and dependable source of truth for all employee data across your organization. From onboarding to offboarding, every record is securely stored, consistently structured, and instantly accessible when needed. It eliminates scattered spreadsheets and disconnected systems by bringing employee profiles, contracts, documentation, and role histories into one unified platform. Performance management becomes more transparent with structured review cycles, measurable KPIs, and continuous feedback tracking. `,

      `Designed for modern HR teams, the platform automates repetitive administrative tasks through intelligent workflows and structured  approval processes. Smart notifications ensure that reviews, document submissions, and policy acknowledgments are never delayed. Integrated attendance, leave, and payroll systems operate seamlessly within the same ecosystem to reduce operational friction. Real-time reporting transforms raw workforce data into actionable business insights. Managers can monitor productivity trends, engagement levels, and performance metrics with clarity and confidence. `,

      `Designed for modern HR teams, the platform automates repetitive administrative tasks through intelligent workflows and structured  approval processes. Smart notifications ensure that reviews, document submissions, and policy acknowledgments are never delayed. Integrated attendance, leave, and payroll systems operate seamlessly within the same ecosystem to reduce operational friction. Real-time reporting transforms raw workforce data into actionable business insights. Managers can monitor productivity trends, engagement levels, and performance metrics with clarity and confidence. `,
    ],

    features: [
      {
        title: "Employee Database",
        description:
          "Centralized profiles with documents, history, and custom fields.",
        icon: "users",
      },
      {
        title: "Onboarding Workflows",
        description: "Automated checklists and task assignments for new hires.",
        icon: "user-plus",
      },
      {
        title: "Performance Reviews",
        description:
          "360° feedback, goal tracking, and review cycle management.",
        icon: "star",
      },
      {
        title: "Document Management",
        description:
          "Store, organize, and e-sign employment documents securely.",
        icon: "folder",
      },
      {
        title: "Org Chart",
        description:
          "Visual organization structure with drag-and-drop editing.",
        icon: "git-branch",
      },
      {
        title: "Compliance Tracking",
        description:
          "Stay on top of certifications, trainings, and regulatory deadlines.",
        icon: "shield",
      },
    ],
    problems: [
      {
        problem: "Employee data scattered across spreadsheets and emails",
        solution:
          "One centralized database with search, filters, and access controls.",
      },
      {
        problem: "Onboarding takes weeks and drops the ball",
        solution:
          "Automated workflows ensure nothing falls through the cracks on day one.",
      },
      {
        problem: "Performance reviews feel arbitrary and biased",
        solution:
          "Structured 360° reviews with data-driven insights for fair evaluations.",
      },
    ],
    useCases: [
      {
        title: "Scaling Startups",
        description:
          "Set up HR processes from scratch as your team grows from 10 to 500+.",
        audience: "Founders & HR leads",
      },
      {
        title: "Multi-Location Companies",
        description:
          "Manage employees across offices, countries, and compliance frameworks.",
        audience: "Global HR teams",
      },
      {
        title: "Compliance-Heavy Industries",
        description:
          "Track certifications, trainings, and regulatory requirements automatically.",
        audience: "Healthcare & finance HR",
      },
    ],
    testimonials: [
      {
        content:
          "Onboarding went from 2 weeks of chaos to a smooth 3-day process.",
        name: "Lisa Park",
        role: "People Ops Manager",
        company: "ScaleUp Labs",
      },
      {
        content:
          "Finally, one place for everything. No more digging through shared drives.",
        name: "Ahmed Hassan",
        role: "HR Business Partner",
        company: "GlobalTech",
      },
    ],
    faqs: [
      {
        question: "Can I customize employee fields?",
        answer:
          "Yes. Add unlimited custom fields, sections, and workflows to match your processes.",
      },
      {
        question: "Is employee data encrypted?",
        answer:
          "All data is encrypted at rest and in transit with enterprise-grade security.",
      },
      {
        question: "Does it handle multi-country compliance?",
        answer:
          "Yes. Configure country-specific policies, leave types, and compliance rules.",
      },
    ],
  },
  {
    slug: "project-management",
    name: "Project Management (PM)",
    shortDescription:
      "Plan, track, and deliver projects on time with visual .",
    highlights: [
      "Kanban & Gantt views",
      "Resource allocation",
      "Time tracking",
    ],
    bestFor: "Teams delivering client projects or internal initiatives",
    cardTagline: "Plan, track, and deliver projects efficiently — from estimation to execution.",
    icon: FolderKanban,
    videoUrl: "#",
    videoCtaTitle: "See Project Management in Action",
    videoCtaDescription:
      "Explore a quick overview of all key features and see how they work together seamlessly to streamline projects, boost productivity, and keep teams on track.",
    heroHeadline: "Project Management That Drives Performance",
    heroSubheadline:
      "Plan projects, allocate resources, track milestones, and deliver on time — with complete visibility and control.",
    aboutTitle: "A Complete Solution for Every Project",
    aboutDescription: [],
    aboutContents: [
      {
        id: 1,
        tag: "Overview",
        title: "Streamline Projects from Planning to Delivery",
        description:
          "QTO Project Management solution gives organizations full visibility and control over projects, tasks, and deadlines. Flexible enough to fit any workflow, it helps teams plan efficiently, allocate resources, track progress, and deliver on time across all departments.",
        image: "/assets/images/attendance.png",
        imageAlt: "Project Management - Overview",
      },
      {
        id: 2,
        tag: "Problem",
        title: "Lack of Visibility and Control Can Derail Projects",
        description:
          "Without clear visibility into resources and timelines, organizations often struggle to know who is working on what, identify at-risk tasks, and keep projects on track.",
        image: "/assets/images/attendance.png",
        imageAlt: "Project Management - Problem",
      },
      {
        id: 3,
        tag: "Solution",
        title: "Empower Teams to Deliver Projects on Time",
        description:
          "Our Project Management solution addresses visibility and control challenges by providing built-in resource allocation, task tracking, and progress monitoring. Teams can see who is working on what, identify potential risks early, and take proactive actions to keep projects on schedule—across all departments and industries.",
        image: "/assets/images/attendance.png",
        imageAlt: "Project Management - Solution",
      },
    ],
    features: [
      {
        title: "Kanban Boards",
        description:
          "Visualize tasks with intuitive drag-and-drop cards and customizable statuses for effortless workflow management.",
        icon: "columns",
      },
      {
        title: "Gantt Charts",
        description:
          "Track project timelines, dependencies, milestones, and critical paths to ensure projects stay on schedule.",
        icon: "gantt-chart",
      },
      {
        title: "Resource Allocation",
        description:
          "Monitor team capacity and assign work efficiently to prevent bottlenecks and avoid employee burnout.",
        icon: "users",
      },
      {
        title: "Time Tracking",
        description:
          "Log hours for tasks and projects to support accurate reporting, billing, and productivity analysis.",
        icon: "clock",
      },
      {
        title: "Sprint Planning",
        description:
          "Plan agile sprints, set velocity targets, and conduct retrospectives to continuously improve team performance.",
        icon: "zap",
      },
      {
        title: "Client Portal",
        description:
          "Provide clients with a branded, read-only view to share project progress and enhance transparency.",
        icon: "globe",
      },
    ],
    problems: [
      {
        problem: "Projects always run late and over budget",
        solution:
          "Gantt charts with dependencies and real-time progress tracking keep projects on rails.",
      },
      {
        problem: "No idea who's overloaded and who's idle",
        solution:
          "Resource allocation views show capacity at a glance so you can rebalance instantly.",
      },
      {
        problem: "Stakeholders constantly ask for status updates",
        solution:
          "Automated reports and client portals give stakeholders self-serve access to progress.",
      },
    ],
    useCases: [
      {
        title: "Software Development",
        description:
          "Run agile sprints with backlog grooming, velocity tracking, and burndown charts.",
        audience: "Engineering teams",
      },
      {
        title: "Marketing Campaigns",
        description:
          "Plan multi-channel campaigns with task dependencies and approval workflows.",
        audience: "Marketing teams",
      },
      {
        title: "Client Services",
        description:
          "Manage client deliverables with time tracking and branded status reports.",
        audience: "Agencies & consultancies",
      },
    ],
    testimonials: [
      {
        content: "We went from 40% on-time delivery to 92% in three months.",
        name: "Michael Torres",
        role: "VP of Engineering",
        company: "DevCore Systems",
      },
      {
        content:
          "The resource allocation view alone saved us from burning out two senior developers.",
        name: "Emily Watson",
        role: "Project Director",
        company: "Catalyst Agency",
      },
    ],
    faqs: [
      {
        question: "Is the platform suitable for all types of organizations?",
        answer:
          "Yes. Our solution is flexible and adapts to workflows across industries and departments.",
      },
      {
        question: "Can clients see project progress?",
        answer:
          "Yes. Share a branded client portal with customizable visibility settings to keep clients informed without compromising internal data.",
      },
      {
        question: "Can I track resources and deadlines in real time?",
        answer:
          "Absolutely. You can monitor tasks, projects, and team workloads in real time to ensure efficiency and timely delivery.",
      },
    ],
  },
  {
    slug: "crms",
    name: "CRM",
    shortDescription:
      "Manage leads, generate proposals.",
    highlights: [
      "Lead to Project Lifecycle",
      "BOQ & Cost Estimation",
      "Proposal & Deal Tracking",
    ],
    bestFor: "Construction companies handling project estimation and execution",
    cardTagline: "Manage client relationships, leads, and project pipelines in one system.",
    icon: Building2,
    videoUrl: "#",
    heroHeadline: "From Opportunity to Completion",
    heroSubheadline:
      "Track leads, manage proposals, monitor progress, and turn opportunities into successful projects — all in one unified CRM platform.",
    heroCtaLabel: "Book a Demo",
    aboutTitle: "From Leads to Successful Outcomes",
    aboutDescription: [],
    aboutContents: [
      {
        id: 1,
        tag: "Overview",
        title: "From Leads to Completed Projects, Effortlessly",
        description:
          "Our CRM is designed to manage the entire lifecycle of opportunities and projects. From initial inquiry to project completion, every stage is tracked, organized, and optimized to help teams to close deals efficiently and deliver successful outcomes.",
        image: "/assets/images/attendance.png",
        imageAlt: "CRM - Overview",
      },
      {
        id: 2,
        tag: "Problem",
        title: "Lost Context Leads to Missed Opportunities",
        description:
          "Organizations often struggle to manage leads, generate accurate proposals, track costs, and transition approved opportunities into active projects—without losing data, context, or workflow continuity.",
        image: "/assets/images/attendance.png",
        imageAlt: "CRM - Problem",
      },
      {
        id: 3,
        tag: "Solution",
        title: "Seamlessly Manage Opportunities from Start to Finish",
        description:
          "Our CRM streamlines the entire process—from lead management and cost calculations to professional proposals and project handovers. Teams can track every stage, maintain full context, and transition approved opportunities into active projects effortlessly, ensuring accuracy, efficiency, and continuity across all workflows.",
        image: "/assets/images/attendance.png",
        imageAlt: "CRM - Solution",
      },
    ],

    featuresSectionTitle: "Everything You Need in One CRM",
    testimonialsSectionTag: "Client Testimonials",
    testimonialsSectionTitle: "Trusted by Growing Organizations",
    testimonialsSectionDescription:
      "Discover how businesses improve efficiency, accuracy, and workforce visibility using QTO ERP.",

    features: [
      {
        title: "Lead & Inquiry Management",
        description:
          "Effortlessly capture, assign, and track all incoming leads with complete visibility across your sales pipeline, ensuring no opportunity is overlooked.",
        icon: "users",
      },
      {
        title: "Company & Contact Profiles",
        description:
          "Maintain structured, centralized records of clients, partners, and key stakeholders for streamlined communication and relationship management.",
        icon: "building",
      },
      {
        title: "Opportunity & Deal Tracking",
        description:
          "Manage opportunities from initial qualification to negotiation and closure, keeping every stage organized and transparent for your team.",
        icon: "trending-up",
      },
      {
        title: "Proposal Management",
        description:
          "Generate, send, revise, and track proposals digitally, enabling faster approvals and reducing administrative overhead.",
        icon: "file-text",
      },
      {
        title: "Finance & Payment Integration",
        description:
          "Monitor payment milestones, track project-related financial data, and ensure accurate reporting for seamless financial management.",
        icon: "credit-card",
      },
    ],

    // workflow: [
    //   {
    //     stage: 'Lead Capture',
    //     description:
    //       'Leads are created manually or captured from website forms and assigned to sales executives.',
    //     path: '/crms/leads',
    //   },
    //   {
    //     stage: 'Qualification & Deal Creation',
    //     description:
    //       'Qualified leads are converted into opportunities and tracked in the sales pipeline.',
    //     path: '/crms/opportunities-deals',
    //   },
    //   {
    //     stage: 'Estimation & BOQ Preparation',
    //     description:
    //       'Project estimation is prepared with material, labor, overhead, and profit margins.',
    //     path: '/crms/projects-estimation',
    //   },
    //   {
    //     stage: 'Proposal Submission',
    //     description:
    //       'Professional proposals are generated and sent for client approval.',
    //     path: '/crms/proposals',
    //   },
    //   {
    //     stage: 'Project Conversion',
    //     description:
    //       'Approved estimations are converted into active project management records.',
    //     path: '/crms/projects-estimation/project-overview',
    //   },
    //   {
    //     stage: 'Finance & Reporting',
    //     description:
    //       'Payments are synced, and reports are generated for revenue and sales performance.',
    //     path: '/crms/finance',
    //   },
    // ],

    problems: [
      {
        problem: "Leads get lost between sales and estimation teams",
        solution:
          "Centralized CRM ensures smooth handover from lead qualification to estimation.",
      },
      {
        problem: "Manual BOQ calculations cause pricing errors",
        solution:
          "Structured estimation templates automate cost calculations and margin tracking.",
      },
      {
        problem: "No visibility on deal status or approval stage",
        solution:
          "Real-time pipeline dashboards show deal stage, proposal status, and conversion rates.",
      },
      {
        problem: "Difficulty converting estimation into project execution",
        solution:
          "One-click conversion turns approved estimations into active project workflows.",
      },
    ],

    useCases: [
      {
        title: "Residential Construction",
        description:
          "Manage home-building projects from inquiry to final completion.",
        audience: "Builders & Contractors",
      },
      {
        title: "Commercial Projects",
        description:
          "Track large-scale commercial bids, multi-phase estimations, and milestone payments.",
        audience: "Project Directors",
      },
      {
        title: "Renovation & Interior Projects",
        description:
          "Prepare detailed BOQs and manage small-to-mid scale renovation deals.",
        audience: "Interior Contractors",
      },
    ],

    testimonials: [
      {
        content:
          "We increased our bid-to-project conversion rate by 35% after implementing this CRM.",
        name: "Ahmed Raza",
        role: "Business Development Manager",
        company: "Skyline Constructions",
      },
      {
        content:
          "Our estimation errors reduced significantly because everything is now structured and automated.",
        name: "Michael Torres",
        role: "Senior Estimator",
        company: "BuildCore Ltd.",
      },
    ],

    faqs: [
      {
        question: "Can approved proposals be converted into active projects?",
        answer:
          "Yes. Once a proposal is approved, the system seamlessly converts it into a structured project ready for execution and tracking.",
      },
      {
        question: "Does the system support detailed cost tracking?",
        answer:
          "Yes. You can track costs, budgets, and expenses for projects or opportunities, helping teams manage resources efficiently and maintain financial oversight.",
      },
      {
        question: "Can finance track milestone-based payments?",
        answer:
          "Yes. The finance module allows tracking of milestone invoices, partial payments, and outstanding balances to ensure accurate financial oversight.",
      },
      {
        question: "Are sales performance and reporting features available?",
        answer:
          "Yes. The platform provides reports on sales, lead conversion, revenue forecasting, and overall deal performance to support informed decision-making.",
      },
    ],
  },
   {
    slug: "salary",
    name: "Salary / Payroll",
    image: "/assets/images/salary.png",
    shortDescription:
      "Automate payroll and manage salaries (Coming Soon).",
    highlights: [
      "Automated Payroll",
      "Salary Structures",
      "Deduction Management",
    ],
    bestFor: "Organizations automating payroll",
    cardTagline: "Automate payroll processing with accurate calculations and compliance support.",
    icon: DollarSign,
    videoUrl: "#",
    heroHeadline: "Salary Management - Coming Soon",
    heroSubheadline:
      "Automate payroll processing, manage employee salaries, and streamline approvals with precision.",
    aboutTitle: "QTO Salary",
    aboutDescription: [
      "QTO Salary module is coming soon and will transform how you manage payroll. This comprehensive solution will automate salary processing, manage complex salary structures, and handle deductions effortlessly.",
      "Say goodbye to manual payroll errors and time-consuming calculations. Our system will integrate seamlessly with attendance data to ensure accurate salary computations, manage tax withholdings, and generate compliant payslips.",
      "Perfect for organizations of all sizes, QTO Salary will provide transparency to employees with instant access to their salary details while giving HR teams complete control and audit trails.",
    ],
    features: [],
    problems: [],
    useCases: [
      {
        title: "For HR Teams",
        description:
          "Automate payroll processing and reduce manual tasks significantly.",
        audience: "HR Professionals",
      },
      {
        title: "For Finance",
        description:
          "Ensure accurate salary accounting and compliance reporting.",
        audience: "Finance Teams",
      },
      {
        title: "For Employees",
        description:
          "Access detailed salary information and payslips instantly.",
        audience: "All Employees",
      },
    ],
    testimonials: [],
    faqs: [],
  },
  {
    slug: "finance",
    name: "Finance",
    image: "/assets/images/finance.png",
    shortDescription:
      "Efficiently handle budgets and financial accounts.",
    highlights: [
      "Budget Management",
      "Expense Tracking",
      "Financial Reports",
    ],
    bestFor: "Organizations managing finances",
    cardTagline: "Track expenses, manage budgets, and maintain full financial visibility.",
    icon: TrendingUp,
    videoUrl: "#",
    heroHeadline: "Finance Management - Coming Soon",
    heroSubheadline:
      "Track accounts, budgets, and financial operations with comprehensive visibility and control.",
    aboutTitle: "QTO Finance",
    aboutDescription: [
      "QTO Finance module is coming soon and will revolutionize how you manage your organization's finances. This powerful tool will provide complete visibility into all financial operations with real-time tracking and reporting capabilities.",
      "Manage budgets effectively, track expenses across departments, and generate comprehensive financial reports with just a few clicks. Our system will integrate seamlessly with all other QTO modules to provide a unified financial picture.",
      "Built for modern organizations, QTO Finance will offer financial planning tools, forecasting capabilities, and compliance support to help you make informed decisions and maintain financial health.",
    ],
    features: [],
    problems: [],
    useCases: [
      {
        title: "For Finance Teams",
        description:
          "Manage accounts, budgets, and generate comprehensive financial reports.",
        audience: "Finance Professionals",
      },
      {
        title: "For Department Heads",
        description:
          "Track departmental budgets and monitor expense spending.",
        audience: "Team Managers",
      },
      {
        title: "For Executives",
        description:
          "Get organization-wide financial insights and performance analytics.",
        audience: "Senior Management",
      },
    ],
    testimonials: [],
    faqs: [],
  },
];

export const getAppBySlug = (slug: string) => apps.find((a) => a.slug === slug);
