import { SolutionsType, solutionType} from "@/types";

export const solutions: SolutionsType = [
  {
    slug: "hr-teams",
    title: "HR Teams",
    audience: "HR Professionals",
    heroHeadline: "Built for Modern HR Teams",
    heroSubheadline:
      "Automate the busywork so you can focus on people strategy, culture, and employee experience.",
    problems: [
      {
        title: "Drowning in Admin",
        description:
          "Manually processing leave requests, updating spreadsheets, and chasing documents wastes hours every week.",
      },
      {
        title: "Inconsistent Processes",
        description:
          "Without standardized workflows, onboarding quality varies and compliance gaps appear.",
      },
      {
        title: "No Data for Decisions",
        description:
          "Without centralized analytics, HR can't demonstrate impact or predict workforce needs.",
      },
    ],
    recommendedModules: ["hrm", "attendance"],
    testimonial: {
      content:
        "This platform gave our HR team superpowers. We went from reactive to strategic in months.",
      name: "Lisa Park",
      role: "People Ops Manager",
      company: "ScaleUp Labs",
    },
    solutionFaqs: [
      {
        question: "Can we automate onboarding and offboarding?",
        answer:
          "Yes. You can create structured onboarding workflows, assign tasks automatically, collect documents digitally, and ensure compliance from day one.",
      },
      {
        question: "Does it handle leave and attendance tracking?",
        answer:
          "Absolutely. Employees can submit leave requests online, managers approve with one click, and attendance integrates with reports in real time.",
      },
      {
        question: "Can HR generate workforce reports?",
        answer:
          "Yes. HR teams can access dashboards and export reports for headcount, leave balances, attendance trends, and employee performance metrics.",
      },
      {
        question: "Is employee data secure?",
        answer:
          "Yes. Role-based permissions ensure sensitive HR data is only accessible to authorized users.",
      },
    ],
    useCases: [
      {
        slug: "it-companies",
        industry: "IT Companies",
        description: "Manage remote teams, flexible schedules, and employee development programs.",
        specificNeeds: ["Remote attendance tracking", "Skill development tracking", "Performance reviews", "Leave management"],
        subNav: ["Remote Tracking", "Flexible Hours", "Leave Management", "Overtime Rules", "Analytics"],
        features: [
          {
            tag: "REMOTE ATTENDANCE",
            title: "Track Remote Developers\nWithout Micromanaging",
            desc: "Let developers clock in via mobile or desktop from anywhere in the world. GPS-verified check-ins and app-based tracking mean you always know who is online without invading personal space. Geo-fencing and IP restrictions give you control with flexibility.",
            reverse: false,
          },
          {
            tag: "FLEXIBLE SCHEDULES",
            title: "Support Flex Hours and\nWork-from-Home Policies",
            desc: "IT teams thrive on flexibility. Define custom shift windows, core hours, and async schedules to fit your engineering culture. Our system handles multiple time zones, rolling shifts, and individual schedule exceptions effortlessly.",
            reverse: true,
          },
          {
            tag: "LEAVE MANAGEMENT",
            title: "Automate Leave Requests\nand Approvals in Minutes",
            desc: "Developers request time off with one click; managers approve on mobile. Balance tracking, carry-forward rules, and calendar sync keep your sprint planning accurate. No more surprise absences blocking a release.",
            reverse: false,
          },
          {
            tag: "ANALYTICS DASHBOARD",
            title: "Measure Productivity Across\nDistributed Engineering Teams",
            desc: "Visualize attendance patterns, late logins, and absentee trends across departments or teams. Correlate attendance data with sprint velocity to spot burnout risks before they hit your delivery timelines.",
            reverse: true,
          },
        ],
      },
      {
        slug: "call-centers",
        industry: "Call Centers",
        description: "Track shifts, manage high-volume workforce, and monitor performance metrics.",
        specificNeeds: ["Shift scheduling", "Break management", "Performance tracking", "Attendance monitoring"],
        subNav: ["Shift Management", "Break Tracking", "Overtime", "Attendance Reports", "Performance"],
        features: [
          {
            tag: "SHIFT SCHEDULING",
            title: "Fill Every Shift Slot\nAutomatically Without Conflicts",
            desc: "Drag-and-drop shift planner lets supervisors build weekly rosters in minutes. The system flags double-bookings, understaffed shifts, and overtime risks before they happen. Auto-fill uses availability data to suggest the best agents for each slot.",
            reverse: false,
          },
          {
            tag: "BREAK TRACKING",
            title: "Monitor Breaks and Idle Time\nDown to the Minute",
            desc: "Real-time break timers ensure agents take compliant breaks without exceeding allowed windows. Supervisors see live break status on a floor-wide dashboard, reducing idle time that hurts SLA performance.",
            reverse: true,
          },
          {
            tag: "OVERTIME MANAGEMENT",
            title: "Control Overtime Costs With\nAutomated Rules and Alerts",
            desc: "Set daily and weekly overtime thresholds per agent or team. The system flags approaching limits in real time and auto-calculates overtime pay for payroll. Cut unplanned overtime spend by up to 30%.",
            reverse: false,
          },
          {
            tag: "ATTENDANCE REPORTING",
            title: "Generate Floor-Wide Attendance\nReports in One Click",
            desc: "Produce shift adherence reports, late arrival summaries, and absence trend analyses instantly. Share automated reports with workforce management teams to continuously improve staffing efficiency.",
            reverse: true,
          },
        ],
      },
      {
        slug: "construction",
        industry: "Construction Companies",
        description: "Monitor site attendance, manage safety compliance, and track field workers.",
        specificNeeds: ["GPS-based attendance", "Safety compliance", "Site management", "Equipment tracking"],
        subNav: ["GPS Check-In", "Multi-Site", "Safety Compliance", "Field Reports", "Payroll Sync"],
        features: [
          {
            tag: "GPS ATTENDANCE",
            title: "Verify On-Site Presence\nWith GPS Geo-Fencing",
            desc: "Workers clock in only when physically on site using GPS geo-fencing. Multiple perimeters can be configured per project, so labourers moving between zones are tracked accurately. Eliminate buddy-punching and phantom attendance on remote construction sites.",
            reverse: false,
          },
          {
            tag: "MULTI-SITE MANAGEMENT",
            title: "Manage Attendance Across\nEvery Project Site Centrally",
            desc: "One dashboard shows attendance for all active construction sites in real time. Site supervisors get their own view while head office sees the full picture. Add or remove sites as projects start and finish without any reconfiguration.",
            reverse: true,
          },
          {
            tag: "SAFETY COMPLIANCE",
            title: "Ensure Safety Inductions\nAre Completed Before Entry",
            desc: "Block clock-in for workers who have not completed mandatory safety inductions or whose certifications have expired. Compliance gates protect your site and significantly reduce liability.",
            reverse: false,
          },
          {
            tag: "PAYROLL SYNC",
            title: "Feed Accurate Hours Directly\nInto Your Payroll System",
            desc: "Daily work hours, overtime, and hazard allowances flow automatically from attendance records into payroll calculations. Eliminate manual timesheets and pay disputes on large multi-crew projects.",
            reverse: true,
          },
        ],
      },
      {
        slug: "education",
        industry: "Education System",
        description: "Manage staff attendance, academic schedules, and administrative workflows.",
        specificNeeds: ["Academic calendar", "Staff scheduling", "Leave tracking", "Performance assessment"],
        subNav: ["Academic Calendar", "Staff Scheduling", "Leave Tracking", "Substitute Management", "Reports"],
        features: [
          {
            tag: "ACADEMIC CALENDAR",
            title: "Sync Attendance Rules With\nYour Academic Calendar",
            desc: "Configure term dates, public holidays, exam periods, and professional development days once. The system automatically applies the right attendance rules for each period, removing manual adjustments at every semester change.",
            reverse: false,
          },
          {
            tag: "STAFF SCHEDULING",
            title: "Build Timetables That Respect\nTeacher Workload Limits",
            desc: "Assign classes and duties while the system monitors weekly teaching hours, free periods, and contractual limits. Spot over-allocated staff before timetables are published to avoid grievances and burnout.",
            reverse: true,
          },
          {
            tag: "SUBSTITUTE MANAGEMENT",
            title: "Fill Absent Teacher Slots\nInstantly With Substitutes",
            desc: "When a teacher marks absent, the system automatically suggests available substitutes based on subject qualification and current schedule. Approvals happen in one click, and the substitute is notified immediately.",
            reverse: false,
          },
          {
            tag: "PERFORMANCE ASSESSMENT",
            title: "Link Attendance Data to Staff\nPerformance Reviews",
            desc: "Attendance records feed directly into annual staff appraisal reports. Identify patterns of lateness or absenteeism objectively and pair them with performance scores for fair, data-backed evaluations.",
            reverse: true,
          },
        ],
      },
      {
        slug: "banking",
        industry: "Banking System",
        description: "Ensure compliance, manage branch operations, and track employee performance.",
        specificNeeds: ["Compliance tracking", "Branch management", "Audit trails", "Secure access control"],
        subNav: ["Branch Attendance", "Compliance", "Audit Trails", "Shift Rosters", "Access Control"],
        features: [
          {
            tag: "BRANCH ATTENDANCE",
            title: "Track Punctuality Across\nEvery Branch in Real Time",
            desc: "Head office sees live attendance status for all branches on a single map-based dashboard. Late arrivals and unplanned absences in customer-facing roles trigger instant alerts so branch managers can act before opening.",
            reverse: false,
          },
          {
            tag: "COMPLIANCE TRACKING",
            title: "Meet Regulatory Requirements\nWith Automated Audit Logs",
            desc: "Every clock-in, shift change, and approval is recorded with a tamper-proof timestamp. Audit logs satisfy internal compliance teams and external regulators without any manual export or data collection.",
            reverse: true,
          },
          {
            tag: "SECURE ACCESS CONTROL",
            title: "Restrict Sensitive Areas With\nRole-Based Entry Rules",
            desc: "Integrate attendance data with building access systems so only scheduled, verified staff enter secure zones such as vaults and server rooms. Exceptions generate automatic alerts for security teams.",
            reverse: false,
          },
          {
            tag: "SHIFT ROSTERS",
            title: "Publish and Manage Branch\nShift Rosters Weeks Ahead",
            desc: "Create and publish rolling shift rosters for teller and back-office teams. Staff receive schedules on their phones, and changes propagate instantly. Coverage gaps are highlighted before they affect service levels.",
            reverse: true,
          },
        ],
      },
      {
        slug: "offices",
        industry: "Offices",
        description: "Streamline corporate HR operations with automation and analytics.",
        specificNeeds: ["Desk booking", "Hybrid work management", "Employee self-service", "Analytics dashboard"],
        subNav: ["Hybrid Work", "Self-Service", "Leave Portal", "Desk Booking", "Workforce Analytics"],
        features: [
          {
            tag: "HYBRID WORK MANAGEMENT",
            title: "Balance In-Office and Remote\nDays Across the Whole Team",
            desc: "Employees set their in-office days for the week; managers see team presence calendars at a glance. Automated capacity limits prevent overcrowding while ensuring collaborative days are aligned across departments.",
            reverse: false,
          },
          {
            tag: "EMPLOYEE SELF-SERVICE",
            title: "Let Employees Manage Their\nOwn Attendance and Leave",
            desc: "Staff clock in, request leave, swap shifts, and view their balances without ever contacting HR. Self-service reduces HR admin load by up to 60% and gives employees the autonomy they expect in a modern workplace.",
            reverse: true,
          },
          {
            tag: "DESK BOOKING",
            title: "Coordinate Desk and Meeting\nRoom Bookings With Attendance",
            desc: "When an employee marks an in-office day, the platform suggests available desks and lets them book in the same step. Utilisation data helps facilities teams right-size office space and cut real-estate costs.",
            reverse: false,
          },
          {
            tag: "WORKFORCE ANALYTICS",
            title: "Turn Attendance Patterns Into\nSmarter People Decisions",
            desc: "Track absenteeism rates, peak office days, and department utilisation trends over time. Executive dashboards surface the data leadership needs to make evidence-based decisions on headcount, office space, and wellbeing programmes.",
            reverse: true,
          },
        ],
      },
    ],
  },

  {
    slug: "project-teams",
    title: "Project Teams",
    audience: "Project Managers & Team Leads",
    heroHeadline: "Ship Projects On Time Every Time",
    heroSubheadline:
      "Give your team clarity on priorities, deadlines, and capacity — so nothing falls through the cracks.",
    problems: [
      {
        title: "Missed Deadlines",
        description:
          "Without clear timelines and dependencies, projects slip and clients lose trust.",
      },
      {
        title: "Resource Conflicts",
        description:
          "Team members get double-booked, leading to burnout and quality issues.",
      },
      {
        title: "Status Update Hell",
        description:
          "Stakeholders constantly ping for updates because there's no single source of truth.",
      },
    ],
    recommendedModules: ["project-management", "attendance"],
    testimonial: {
      content: "We went from 40% on-time delivery to 92% in three months.",
      name: "Michael Torres",
      role: "VP of Engineering",
      company: "DevCore Systems",
    },
    solutionFaqs: [
      {
        question: "Can we track project progress in real time?",
        answer:
          "Yes. You get live dashboards showing task completion, deadlines, milestones, and team workload.",
      },
      {
        question: "Does it help prevent resource conflicts?",
        answer:
          "Yes. Capacity planning tools help managers assign work based on availability and avoid overbooking team members.",
      },
      {
        question: "Can stakeholders view project updates?",
        answer:
          "Yes. You can provide controlled access or share progress reports, reducing constant status update requests.",
      },
      {
        question: "Does it integrate with attendance tracking?",
        answer:
          "Yes. You can connect attendance data to project performance insights for better planning and forecasting.",
      },
    ],
    useCases: [
      {
        slug: "it-companies",
        industry: "IT Companies",
        description: "Manage software development projects, sprints, and agile workflows.",
        specificNeeds: ["Sprint planning", "Bug tracking", "Code deployment tracking", "Resource allocation"],
        subNav: ["Sprint Planning", "Task Boards", "Bug Tracking", "Resource Planning", "Velocity Reports"],
        features: [
          {
            tag: "SPRINT PLANNING",
            title: "Plan Sprints With Full Visibility\nInto Team Capacity",
            desc: "Pull backlog items into sprints with drag-and-drop simplicity. Capacity calculations factor in leaves, public holidays, and existing commitments so you never over-plan a sprint. Developers see their tasks the moment sprint planning closes.",
            reverse: false,
          },
          {
            tag: "TASK BOARDS",
            title: "Visualise Work in Progress\nWith Agile Kanban Boards",
            desc: "Real-time Kanban boards give every team member and stakeholder a live view of what is in progress, blocked, or done. WIP limits flag bottlenecks before they delay the release and push developers to finish before pulling new work.",
            reverse: true,
          },
          {
            tag: "BUG TRACKING",
            title: "Log, Prioritise, and Close Bugs\nWithin the Same Workflow",
            desc: "Testers log bugs directly against user stories. Severity and priority labels route issues to the right developer instantly. Linked tasks mean bug resolution is tracked alongside feature delivery without switching tools.",
            reverse: false,
          },
          {
            tag: "VELOCITY REPORTS",
            title: "Forecast Delivery Dates Using\nReal Historical Velocity Data",
            desc: "Velocity charts plot story points completed per sprint over time. Use the trend line to set accurate delivery expectations with clients and product owners. Stop guessing — let data drive your roadmap commitments.",
            reverse: true,
          },
        ],
      },
      {
        slug: "construction",
        industry: "Construction Companies",
        description: "Track project milestones, equipment, and site progress.",
        specificNeeds: ["Site monitoring", "Equipment tracking", "Milestone tracking", "Budget management"],
        subNav: ["Milestones", "Site Progress", "Budget Tracking", "Equipment", "Subcontractors"],
        features: [
          {
            tag: "MILESTONE TRACKING",
            title: "Keep Every Phase of Your Build\non Schedule and Visible",
            desc: "Break projects into phases and milestones with clear owners and deadlines. Gantt-style timelines show dependencies between civil, structural, and finishing trades so delays in one phase surface immediately across the programme.",
            reverse: false,
          },
          {
            tag: "BUDGET MANAGEMENT",
            title: "Track Spend Against Budget\nAcross Every Cost Category",
            desc: "Real-time budget dashboards compare planned versus actual spend for materials, labour, and equipment. Variance alerts reach project managers before overruns become unmanageable, protecting your contract margins.",
            reverse: true,
          },
          {
            tag: "SUBCONTRACTOR MANAGEMENT",
            title: "Coordinate Subcontractors With\nClear Scope and Deadlines",
            desc: "Assign tasks and milestones to subcontractors with defined deliverables and sign-off criteria. Progress updates feed into the master project plan so you always know whether external teams are on track.",
            reverse: false,
          },
          {
            tag: "SITE PROGRESS REPORTS",
            title: "Generate Client-Ready Site\nProgress Reports in Minutes",
            desc: "Pull completed milestones, budget summaries, and issue logs into branded reports for clients and stakeholders. Weekly reporting that used to take half a day now takes minutes, freeing project managers for on-site leadership.",
            reverse: true,
          },
        ],
      },
      {
        slug: "consulting",
        industry: "Consulting Firms",
        description: "Manage client projects, billable hours, and deliverables.",
        specificNeeds: ["Time tracking", "Client billing", "Deliverable management", "Resource planning"],
        subNav: ["Billable Hours", "Client Projects", "Deliverables", "Resource Planning", "Invoicing"],
        features: [
          {
            tag: "BILLABLE HOURS",
            title: "Capture Every Billable Minute\nWithout Manual Timesheets",
            desc: "Consultants log time against client projects in real time via web or mobile. The system enforces billing codes and activity categories so every hour is traceable to a contract line item when it is time to invoice.",
            reverse: false,
          },
          {
            tag: "DELIVERABLE MANAGEMENT",
            title: "Track Client Deliverables From\nDraft to Approved Sign-Off",
            desc: "Attach deliverables to project phases with due dates, owners, and version history. Clients can review and approve inside the platform, creating an audit trail that protects you in contract disputes.",
            reverse: true,
          },
          {
            tag: "RESOURCE PLANNING",
            title: "Allocate Consultants to Engagements\nWithout Overbooking",
            desc: "Capacity heat maps show every consultant's utilisation across all active engagements. Identify gaps to match new opportunities with available experts and avoid the burnout that comes from invisible overallocation.",
            reverse: false,
          },
          {
            tag: "CLIENT REPORTING",
            title: "Deliver Transparent Progress\nReports Clients Actually Value",
            desc: "Automated status reports pull task completion, time spent, and upcoming milestones into clean client-facing dashboards. Reduce status-update meetings and build client confidence with data they can see any time.",
            reverse: true,
          },
        ],
      },
      {
        slug: "manufacturing",
        industry: "Manufacturing",
        description: "Plan production schedules, track orders, and monitor quality.",
        specificNeeds: ["Production planning", "Order tracking", "Quality control", "Inventory management"],
        subNav: ["Production Schedule", "Order Tracking", "Quality Control", "Inventory", "Downtime Reports"],
        features: [
          {
            tag: "PRODUCTION SCHEDULING",
            title: "Build Production Schedules That\nAdapt to Machine Availability",
            desc: "Link production tasks to machine capacity and operator availability. When a machine goes down or a shift changes, the schedule recalculates automatically rather than collapsing. Keep the factory floor moving regardless of disruptions.",
            reverse: false,
          },
          {
            tag: "ORDER TRACKING",
            title: "Give Sales and Clients Live\nVisibility Into Order Progress",
            desc: "Customer orders flow into production tasks with live status updates at every stage. Sales teams see real production progress and can give clients accurate delivery ETAs without chasing the factory floor.",
            reverse: true,
          },
          {
            tag: "QUALITY CONTROL",
            title: "Log Quality Checks and Defects\nDirectly on the Production Line",
            desc: "Operators log quality inspections and defect counts against specific batches. Defect trends surface in dashboards that identify failing machines, shift patterns, or material batches driving quality issues.",
            reverse: false,
          },
          {
            tag: "DOWNTIME REPORTS",
            title: "Quantify and Reduce Unplanned\nDowntime Across All Lines",
            desc: "Every stoppage is logged with cause category, duration, and affected output. Downtime reports rank the top causes so maintenance and operations teams can tackle the biggest productivity drains first.",
            reverse: true,
          },
        ],
      },
      {
        slug: "marketing",
        industry: "Marketing Agencies",
        description: "Coordinate campaigns, manage creative workflows, and track deliverables.",
        specificNeeds: ["Campaign management", "Creative workflows", "Client approvals", "Performance tracking"],
        subNav: ["Campaign Tracker", "Creative Workflow", "Client Approvals", "Deadlines", "Performance"],
        features: [
          {
            tag: "CAMPAIGN MANAGEMENT",
            title: "Keep Every Campaign on Track\nFrom Brief to Launch",
            desc: "Map campaigns to tasks, creative assets, and key dates on a single project board. Account managers, designers, and copywriters always know what is due and what is blocked. No brief gets lost between email threads again.",
            reverse: false,
          },
          {
            tag: "CREATIVE WORKFLOW",
            title: "Move Creative Work Through\nReview Stages Without Bottlenecks",
            desc: "Define creative workflow stages — draft, internal review, client review, approved — and route assets automatically. Everyone sees the current status and comments are centralised, cutting revision rounds and missed feedback.",
            reverse: true,
          },
          {
            tag: "CLIENT APPROVALS",
            title: "Get Client Sign-Off Faster\nWith Structured Approval Flows",
            desc: "Clients receive approval requests with deadline reminders and can approve or mark revisions directly in the platform. Approval timestamps create a clear record, eliminating disputes about what was agreed and when.",
            reverse: false,
          },
          {
            tag: "PERFORMANCE TRACKING",
            title: "Report Campaign Delivery\nPerformance to Leaders and Clients",
            desc: "Track on-time delivery rates, revision counts, and campaign launch accuracy. Show clients and agency leadership a data-backed picture of team performance and continuously improve processes with every campaign.",
            reverse: true,
          },
        ],
      },
    ],
  },

  {
    slug: "owners",
    title: "Business Owners",
    audience: "Founders & Executives",
    heroHeadline: "Run Your Business With Confidence",
    heroSubheadline:
      "Get a bird's-eye view of your workforce, projects, and costs — all in one dashboard.",
    problems: [
      {
        title: "No Visibility",
        description:
          "You don't know who's working on what, how projects are progressing, or where money is going.",
      },
      {
        title: "Tool Sprawl",
        description:
          "Your team uses 5+ different tools that don't talk to each other, creating data silos.",
      },
      {
        title: "Scaling Pains",
        description:
          "Processes that worked at 10 people break at 50. You need systems that grow with you.",
      },
    ],
    recommendedModules: ["hrm", "attendance", "project-management"],
    testimonial: {
      content:
        "One platform replaced four tools and gave me the oversight I was missing.",
      name: "David Kim",
      role: "CEO",
      company: "NovaTech Solutions",
    },
    solutionFaqs: [
      {
        question: "Can I see everything in one dashboard?",
        answer:
          "Yes. Owners get executive-level dashboards combining HR, project, and attendance data for complete operational visibility.",
      },
      {
        question: "Will this replace our existing tools?",
        answer:
          "In most cases, yes. QTO ERP consolidates multiple systems into one unified platform, reducing tool sprawl and saving costs.",
      },
      {
        question: "Is the system scalable as we grow?",
        answer:
          "Absolutely. The platform is modular and supports growing teams without requiring major system changes.",
      },
      {
        question: "Can I control who accesses sensitive data?",
        answer:
          "Yes. Role-based access control ensures financial, HR, and project data is visible only to authorized personnel.",
      },
    ],
    useCases: [
      {
        slug: "startups",
        industry: "Startups",
        description: "Scale operations efficiently with all-in-one workforce management.",
        specificNeeds: ["Rapid onboarding", "Flexible workflows", "Cost tracking", "Growth analytics"],
        subNav: ["Rapid Onboarding", "Org Structure", "Payroll", "Culture Tools", "Growth Analytics"],
        features: [
          {
            tag: "RAPID ONBOARDING",
            title: "Onboard New Hires in Hours\nNot Days With Automated Flows",
            desc: "Pre-built onboarding checklists send tasks to IT, HR, and the hiring manager the moment an offer is accepted. New hires complete paperwork, sign contracts, and watch induction content before their first day, so day one is productive from the start.",
            reverse: false,
          },
          {
            tag: "ORG STRUCTURE",
            title: "Build and Evolve Your Org Chart\nas the Team Grows",
            desc: "Drag-and-drop org builder lets founders define roles, reporting lines, and departments in minutes. As the company scales from 10 to 100, the structure evolves without needing an HR consultant to reconfigure everything.",
            reverse: true,
          },
          {
            tag: "PAYROLL AUTOMATION",
            title: "Run Accurate Payroll Without\na Dedicated Payroll Team",
            desc: "Attendance data, approved overtime, and leave deductions flow into payroll automatically. Founders and part-time HR staff can run an accurate payroll in minutes, with compliance calculations handled by the system.",
            reverse: false,
          },
          {
            tag: "GROWTH ANALYTICS",
            title: "Visualise Your Team Growth\nand Hiring Pipeline in One View",
            desc: "Track headcount growth, department distribution, and cost-per-hire over time. Identify which roles are hardest to fill and monitor offer-to-acceptance rates to continuously sharpen your talent acquisition strategy.",
            reverse: true,
          },
        ],
      },
      {
        slug: "sme",
        industry: "SMEs",
        description: "Manage growing teams with automated HR and project tracking.",
        specificNeeds: ["Employee management", "Payroll automation", "Project tracking", "Reporting"],
        subNav: ["Employee Records", "Payroll", "Leave Policies", "Performance", "Compliance Reports"],
        features: [
          {
            tag: "EMPLOYEE RECORDS",
            title: "Centralise All Employee Data\nin One Secure Digital System",
            desc: "Replace filing cabinets and scattered spreadsheets with a single digital employee record for every team member. Documents, contracts, certifications, and history are accessible to the right people in seconds with full audit trails.",
            reverse: false,
          },
          {
            tag: "LEAVE POLICIES",
            title: "Configure Leave Policies That\nMatch Your Business Rules",
            desc: "Set different accrual rates, carry-forward limits, and approval chains for full-time, part-time, and contract staff. Policy changes apply automatically across all employee records, eliminating manual adjustments.",
            reverse: true,
          },
          {
            tag: "PERFORMANCE MANAGEMENT",
            title: "Run Consistent Performance\nReviews Across Every Department",
            desc: "Quarterly and annual review templates guide managers through structured conversations. Ratings, goals, and development plans are stored against employee records, giving HR a complete performance history for every team member.",
            reverse: false,
          },
          {
            tag: "COMPLIANCE REPORTS",
            title: "Generate Statutory Reports\nand Stay Audit-Ready Year Round",
            desc: "HR compliance reports for labour inspections, tax authorities, and internal audits are generated in one click. All records include tamper-proof timestamps so you can demonstrate compliance at a moment's notice.",
            reverse: true,
          },
        ],
      },
      {
        slug: "enterprises",
        industry: "Enterprises",
        description: "Unify operations across departments with centralized management.",
        specificNeeds: ["Multi-department management", "Advanced analytics", "Integration capabilities", "Compliance management"],
        subNav: ["Multi-Dept HR", "Role-Based Access", "Advanced Analytics", "Integrations", "Audit Trails"],
        features: [
          {
            tag: "MULTI-DEPARTMENT HR",
            title: "Manage HR Across Every\nDivision From One Platform",
            desc: "Each division, country, or business unit operates with its own policies, calendars, and reporting lines inside a single platform. Corporate HR sees the enterprise view while local HR manages their own teams independently.",
            reverse: false,
          },
          {
            tag: "ROLE-BASED ACCESS",
            title: "Control Who Sees What With\nGranular Permission Management",
            desc: "Define hundreds of permission combinations so finance sees cost data, HR sees people data, and executives see the full picture. Sensitive compensation and disciplinary records are visible only to those with explicit authorisation.",
            reverse: true,
          },
          {
            tag: "ADVANCED ANALYTICS",
            title: "Surface Strategic Workforce\nInsights for Executive Teams",
            desc: "Executive dashboards aggregate turnover rates, headcount costs, productivity metrics, and engagement scores across the enterprise. Leadership gets the data need to make confident, evidence-based workforce strategy decisions.",
            reverse: false,
          },
          {
            tag: "ENTERPRISE INTEGRATIONS",
            title: "Connect Seamlessly With Your\nExisting ERP and Finance Stack",
            desc: "Pre-built integrations and an open API connect QTO-ERP to SAP, Oracle, Microsoft Dynamics, and custom finance systems. Bi-directional data sync eliminates duplicate entry and keeps all systems in agreement.",
            reverse: true,
          },
        ],
      },
      {
        slug: "retail",
        industry: "Retail Chains",
        description: "Manage multi-location workforce and operations seamlessly.",
        specificNeeds: ["Multi-location support", "Shift management", "Inventory tracking", "Sales analytics"],
        subNav: ["Multi-Store HR", "Shift Rosters", "Staff Training", "Leave Coverage", "Store Analytics"],
        features: [
          {
            tag: "MULTI-STORE HR",
            title: "Manage Staff Across All Store\nLocations From Head Office",
            desc: "HR administrators at head office create, update, and report on employee records for every store location in the network. Store managers handle day-to-day HR within their location while head office maintains consistency and compliance.",
            reverse: false,
          },
          {
            tag: "SHIFT ROSTERS",
            title: "Publish Store Rosters That\nAlways Meet Minimum Staffing",
            desc: "Minimum staffing rules per store ensure rosters are never published without the floor coverage needed for trading hours. Auto-fill suggests available staff for open slots based on contracts, availability, and skills.",
            reverse: true,
          },
          {
            tag: "STAFF TRAINING TRACKING",
            title: "Track Product and Compliance\nTraining Completion by Store",
            desc: "Central dashboards show training completion rates by store, region, and product category. Automated reminders chase incomplete training before regulatory deadlines, protecting the brand and reducing liability.",
            reverse: false,
          },
          {
            tag: "STORE ANALYTICS",
            title: "Compare HR Metrics Across\nStores to Identify Top Performers",
            desc: "League tables rank stores by absenteeism, turnover, and overtime spend. Store managers benchmark themselves against the network average and regional leaders, creating positive competition to improve workforce performance.",
            reverse: true,
          },
        ],
      },
      {
        slug: "healthcare",
        industry: "Healthcare",
        description: "Coordinate staff schedules, patient care, and compliance requirements.",
        specificNeeds: ["Staff scheduling", "Compliance tracking", "Patient data security", "Emergency management"],
        subNav: ["Clinical Scheduling", "Compliance", "Credentialing", "On-Call Management", "HR Audits"],
        features: [
          {
            tag: "CLINICAL SCHEDULING",
            title: "Build Rosters That Meet Safe\nStaffing Ratios Every Shift",
            desc: "Configure minimum nurse-to-patient ratios for each ward and shift type. The roster builder prevents publication if a shift falls below safe staffing thresholds, protecting patient safety and your regulatory standing.",
            reverse: false,
          },
          {
            tag: "CREDENTIALING",
            title: "Track Licences and Certifications\nSo Expired Staff Cannot Be Rostered",
            desc: "Automated alerts notify HR and managers when clinical licences, first-aid certificates, or mandatory training approvals are approaching expiry. Expired staff are automatically blocked from shift assignment until credentials are renewed.",
            reverse: true,
          },
          {
            tag: "ON-CALL MANAGEMENT",
            title: "Coordinate On-Call and\nEmergency Rosters Without Confusion",
            desc: "On-call schedules are published alongside core rosters so staff always know their emergency obligations. When a callout happens, the system identifies the right clinician by specialty and current availability and notifies them instantly.",
            reverse: false,
          },
          {
            tag: "HR COMPLIANCE AUDITS",
            title: "Produce Audit-Ready HR Records\nfor Every Clinical Inspection",
            desc: "All HR records, shift approvals, and compliance checkpoints are stored with full audit trails. When regulators or accreditation bodies request documentation, every required record is produced from the system in minutes.",
            reverse: true,
          },
        ],
      },
    ],
  },
];

export const getSolutionBySlug = (slug: string): solutionType | undefined =>
  solutions.find((s) => s.slug === slug);
