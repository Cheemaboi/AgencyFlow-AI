export const dashboardMetrics = [
  { label: "Active projects", value: "14", helper: "Across three live client programs" },
  { label: "Pending approvals", value: "07", helper: "Design and copy review stages" },
  { label: "Invoices due", value: "$18.4k", helper: "Next payout window this week" },
  { label: "Team utilization", value: "82%", helper: "Healthy workload across delivery pods" },
];

export const phaseOnePreview = [
  {
    title: "Design tokens",
    description: "Green-first palette, typography scale, radius rules, and shadow system.",
    tag: "Stable",
  },
  {
    title: "App shell",
    description: "Sidebar, topbar, page-header pattern, and route family are in place.",
    tag: "Live",
  },
  {
    title: "Supabase base",
    description: "Client, server, and proxy-safe env access patterns are scaffolded.",
    tag: "Ready",
  },
];

export const marketingHighlights = [
  {
    eyebrow: "Calm operations",
    title: "A polished shell before feature sprawl",
    description:
      "The foundation uses reusable surfaces so future pages inherit consistency instead of re-solving spacing on every screen.",
  },
  {
    eyebrow: "Role-aware planning",
    title: "Public, auth, and app routes are separated early",
    description:
      "This keeps future auth and role routing work deliberate, which matters once client visibility restrictions arrive.",
  },
  {
    eyebrow: "Deployment discipline",
    title: "Environment handling is prepared from day one",
    description:
      "Supabase utilities compile without leaking secrets and the app remains Vercel-friendly during early frontend work.",
  },
];

export const productModules = [
  { title: "Overview", route: "/app", description: "Command-center KPI shell and summary surfaces." },
  { title: "Projects", route: "/app/projects", description: "Pipeline-ready project board destination." },
  { title: "Workspaces", route: "/app/workspaces", description: "Workspace directory and dynamic detail routing." },
  { title: "Messages", route: "/app/messages", description: "Communication surface reserved for threads and meetings." },
  { title: "Files", route: "/app/files", description: "Files, metadata, and approval structure placeholder." },
  { title: "Billing", route: "/app/billing", description: "Finance-focused panels and AI insight slot." },
  { title: "Analytics", route: "/app/analytics", description: "Reporting route separated from billing." },
  { title: "Settings", route: "/app/settings", description: "Appearance and organization control scaffold." },
];

export const quickActions = [
  "Generate client update",
  "Prepare approval bundle",
  "Summarize blockers",
  "Draft follow-up",
];

export const overviewTasks = [
  {
    title: "Prepare Monday client digest",
    time: "09:30",
    owner: "Amna",
    description: "Package status, blockers, and next-step cues for the Northshore retainer.",
  },
  {
    title: "Review homepage delivery set",
    time: "11:00",
    owner: "Noor",
    description: "Finalize hero exploration and confirm which files move to external review.",
  },
  {
    title: "Confirm billing follow-up",
    time: "15:00",
    owner: "Haris",
    description: "Send the revised utilization snapshot before end-of-day finance sync.",
  },
];

export const projectHealth = [
  { name: "Northshore Rebrand", owner: "Lead: Amna", status: "On track", progress: 76 },
  { name: "Cedar Growth Sprint", owner: "Lead: Haris", status: "Needs review", progress: 54 },
  { name: "Atlas Web Launch", owner: "Lead: Noor", status: "Awaiting assets", progress: 62 },
];

export const upcomingMeetings = [
  { title: "Northshore weekly review", time: "Today, 2:00 PM", type: "Client review" },
  { title: "Atlas launch rehearsal", time: "Tomorrow, 10:30 AM", type: "Internal prep" },
  { title: "Cedar strategy recap", time: "Thu, 4:00 PM", type: "Recap call" },
];

export const recentActivity = [
  { title: "Approval requested", detail: "Homepage v4 shared with Northshore stakeholders", time: "8 min ago" },
  { title: "Invoice marked due", detail: "Atlas July milestone invoice enters reminder window", time: "41 min ago" },
  { title: "File version uploaded", detail: "Campaign storyboard updated to revision 3", time: "1 hr ago" },
  { title: "AI summary generated", detail: "Cedar blockers digest prepared for internal lead", time: "2 hr ago" },
];

export const recentFiles = [
  { name: "northshore-homepage-v4.fig", size: "24 MB", status: "Pending review" },
  { name: "atlas-launch-plan.pdf", size: "8 MB", status: "Approved" },
  { name: "cedar-growth-copy.docx", size: "2 MB", status: "Needs changes" },
];

export const aiBrief = [
  "Northshore is moving well, but approvals are concentrated in the next 48 hours.",
  "Atlas is healthy on scope, though final asset collection is the main risk to launch timing.",
  "Cedar needs a tighter owner on feedback consolidation to prevent another review loop.",
];

export const projectsBoardColumns = [
  {
    title: "Backlog",
    accent: "pill-muted",
    cards: [
      {
        name: "Cedar Growth Sprint",
        client: "Cedar Labs",
        due: "Jul 29",
        progress: 18,
        priority: "Medium",
        budget: "$6.2k",
      },
      {
        name: "Elm Email Refresh",
        client: "Elm Partners",
        due: "Aug 02",
        progress: 5,
        priority: "Low",
        budget: "$3.8k",
      },
    ],
  },
  {
    title: "In progress",
    accent: "pill-accent",
    cards: [
      {
        name: "Atlas Web Launch",
        client: "Atlas Partners",
        due: "Jul 22",
        progress: 62,
        priority: "High",
        budget: "$12.5k",
      },
      {
        name: "Hinterland SEO Sprint",
        client: "Hinterland",
        due: "Jul 19",
        progress: 49,
        priority: "Medium",
        budget: "$5.1k",
      },
    ],
  },
  {
    title: "Review",
    accent: "pill-accent",
    cards: [
      {
        name: "Northshore Rebrand",
        client: "Northshore Studio",
        due: "Jul 16",
        progress: 76,
        priority: "High",
        budget: "$18.0k",
      },
      {
        name: "Cove Campaign Copy",
        client: "Cove Wellness",
        due: "Jul 18",
        progress: 83,
        priority: "Medium",
        budget: "$4.7k",
      },
    ],
  },
  {
    title: "Approved",
    accent: "pill-accent",
    cards: [
      {
        name: "Atlas Launch Deck",
        client: "Atlas Partners",
        due: "Jul 10",
        progress: 100,
        priority: "Low",
        budget: "$2.1k",
      },
    ],
  },
  {
    title: "Delivered",
    accent: "pill-muted",
    cards: [
      {
        name: "Verde Reporting Kit",
        client: "Verde Studio",
        due: "Jul 04",
        progress: 100,
        priority: "Low",
        budget: "$6.9k",
      },
    ],
  },
];

export const projectFilters = ["All clients", "This month", "High priority", "Needs review"];

export const projectInsights = [
  "Northshore and Cove are both sitting in review, so approval bandwidth is the current bottleneck.",
  "In-progress work is balanced financially, but copy review is clustering too close to launch dates.",
  "Delivered volume is healthy, which keeps utilization high without overloading the backlog.",
];

export const mockProjects = [
  {
    name: "Northshore Rebrand",
    client: "Northshore Studio",
    stage: "Review",
    due: "Due Jul 16",
    summary: "Identity system, homepage, and launch assets are aligned for external approval.",
  },
  {
    name: "Atlas Web Launch",
    client: "Atlas Partners",
    stage: "In progress",
    due: "Due Jul 22",
    summary: "Launch page build is stable, with final asset delivery still as the pacing item.",
  },
  {
    name: "Cedar Growth Sprint",
    client: "Cedar Labs",
    stage: "Backlog",
    due: "Due Jul 29",
    summary: "Campaign planning is approved internally and ready to move into execution.",
  },
];

export const workspaceListStats = [
  { label: "Live workspaces", value: "9" },
  { label: "Client-visible approvals", value: "12" },
  { label: "Open tasks", value: "38" },
];

export const mockWorkspaces = [
  {
    id: "northshore",
    name: "Northshore Launch Workspace",
    client: "Northshore Studio",
    stage: "Review",
    summary: "Homepage, launch kit, and approval conversations live in one coordinated client view.",
  },
  {
    id: "atlas",
    name: "Atlas Delivery Hub",
    client: "Atlas Partners",
    stage: "In progress",
    summary: "Build tracking, delivery files, and launch coordination are all organized by milestone.",
  },
  {
    id: "cedar",
    name: "Cedar Campaign Room",
    client: "Cedar Labs",
    stage: "Planning",
    summary: "Messaging strategy, deliverables, and decision threads are staged for kickoff.",
  },
];

export const workspaceMilestones = [
  { name: "Homepage polish", due: "Jul 11", status: "In review" },
  { name: "Launch graphics pack", due: "Jul 13", status: "Ready to share" },
  { name: "Client sign-off", due: "Jul 15", status: "Pending" },
];

export const workspaceTasks = [
  { title: "Finalize hero animation notes", assignee: "Noor", state: "In progress" },
  { title: "Package mobile mockups for review", assignee: "Amna", state: "Ready" },
  { title: "Confirm stakeholder approval list", assignee: "Haris", state: "Blocked" },
];

export const workspaceDeliverables = [
  { name: "Homepage Figma", type: "Design", status: "Pending approval" },
  { name: "Launch copy brief", type: "Copy", status: "Approved" },
  { name: "Asset checklist", type: "Planning", status: "Internal" },
];

export const workspaceFeedback = [
  { author: "Sarah Kim", role: "Client", comment: "Hero direction feels right. Need one more variation with softer product framing." },
  { author: "Noor Ahmed", role: "Design lead", comment: "Updating mobile hierarchy before the next approval push." },
];

export const workspaceApprovals = [
  { item: "Homepage v4", reviewers: "Sarah, Daniel", state: "Pending review" },
  { item: "Launch copy batch", reviewers: "Sarah", state: "Approved" },
];

export const workspaceAiCopilot = [
  "Primary risk is review compression between Jul 13 and Jul 15.",
  "Client feedback tone is positive, but the next revision should prioritize clarity over novelty.",
  "A concise update message is ready once mobile variants are attached.",
];

export const conversations = [
  {
    name: "Northshore weekly review",
    project: "Northshore Rebrand",
    unread: 3,
    preview: "Can we include the mobile cut in tomorrow's review deck?",
    time: "10:42 AM",
  },
  {
    name: "Atlas launch prep",
    project: "Atlas Web Launch",
    unread: 1,
    preview: "Engineering needs final copy by Thursday morning.",
    time: "9:15 AM",
  },
  {
    name: "Cedar campaign recap",
    project: "Cedar Growth Sprint",
    unread: 0,
    preview: "Summarized actions are posted in the meeting recap card.",
    time: "Yesterday",
  },
];

export const activeMessages = [
  { author: "Sarah", side: "left", body: "The latest homepage direction feels strong. Can we see one mobile-first variant before sign-off?" },
  { author: "Amna", side: "right", body: "Absolutely. We're packaging the mobile cut this afternoon and can send it with notes." },
  { author: "Daniel", side: "left", body: "Please include the revised headline lockup in the same share." },
];

export const meetingActionItems = [
  "Attach mobile homepage variants to the next approval bundle.",
  "Confirm which launch assets need final brand sign-off.",
  "Draft a short client update covering timeline confidence and next review date.",
];

export const meetingRecap = {
  title: "Northshore weekly review recap",
  summary:
    "Stakeholders approved the overall direction and narrowed feedback to mobile hierarchy plus headline framing. Timing is still on track if the next bundle ships today.",
};

export const fileFolders = [
  { name: "Brand system", count: "18 files", status: "Healthy" },
  { name: "Launch assets", count: "11 files", status: "Needs review" },
  { name: "Client approvals", count: "7 files", status: "Active" },
];

export const uploadQueue = [
  { name: "northshore-homepage-v4.fig", version: "v4", state: "Pending review" },
  { name: "launch-social-kit.zip", version: "v2", state: "Approved" },
  { name: "headline-options.docx", version: "v3", state: "Needs changes" },
];

export const approvalSummary = [
  { label: "Pending review", value: 4 },
  { label: "Needs changes", value: 2 },
  { label: "Approved", value: 9 },
  { label: "Archived", value: 3 },
];

export const versionHistory = [
  { version: "v4", date: "Today", note: "Adjusted mobile hierarchy and CTA spacing" },
  { version: "v3", date: "Jul 05", note: "Refined hero art direction and updated footer" },
  { version: "v2", date: "Jul 03", note: "Initial client review package" },
];

export const revenueCards = [
  { label: "Monthly recurring revenue", value: "$42.8k", helper: "+8.4% vs last month" },
  { label: "Collected this month", value: "$31.2k", helper: "Three invoices cleared this week" },
  { label: "Outstanding balance", value: "$14.6k", helper: "Two invoices entering reminder window" },
  { label: "Utilization", value: "82%", helper: "Delivery team remains in healthy range" },
];

export const revenueTrend = [
  { month: "Jan", value: 24 },
  { month: "Feb", value: 28 },
  { month: "Mar", value: 31 },
  { month: "Apr", value: 35 },
  { month: "May", value: 39 },
  { month: "Jun", value: 43 },
];

export const revenueByClient = [
  { client: "Northshore", value: 38 },
  { client: "Atlas", value: 27 },
  { client: "Cedar", value: 21 },
  { client: "Other", value: 14 },
];

export const upcomingPayments = [
  { client: "Northshore Studio", amount: "$6,200", date: "Jul 12" },
  { client: "Atlas Partners", amount: "$4,850", date: "Jul 15" },
  { client: "Cedar Labs", amount: "$2,950", date: "Jul 18" },
];

export const invoiceTable = [
  ["Northshore Studio", "Due", "$6,200", "Jul 12"],
  ["Atlas Partners", "Paid", "$4,850", "Jul 08"],
  ["Cedar Labs", "Overdue", "$2,950", "Jul 03"],
  ["Verde Studio", "Paid", "$5,400", "Jul 01"],
];

export const billingInsights = [
  "Northshore remains the largest account, so timely approvals directly protect revenue timing.",
  "Overdue balance is small enough to recover quickly if follow-up happens this week.",
  "Utilization is strong, but another large kickoff may require scheduling margin in design review windows.",
];

export const settingsSections = [
  {
    title: "Profile",
    description: "Control owner identity, signature defaults, and notification tone.",
  },
  {
    title: "Organization",
    description: "Manage agency details, workspace defaults, and team invite policy.",
  },
  {
    title: "Notifications",
    description: "Tune approvals, meeting reminders, billing, and digest summaries.",
  },
  {
    title: "Branding",
    description: "Client-visible logo, accent usage, and shared workspace presentation.",
  },
  {
    title: "Integrations",
    description: "Prepare for Supabase, OpenRouter, calendar, and email connections.",
  },
  {
    title: "Appearance",
    description: "Theme preferences, density choices, and future dark mode persistence.",
  },
  {
    title: "Security",
    description: "Session handling, password actions, and access review settings.",
  },
];

export const appearanceOptions = [
  { name: "Premium light", detail: "Default off-white surfaces with green accents", active: true },
  { name: "Dark mode", detail: "Planned token-ready mode with refined contrast", active: false },
  { name: "Compact density", detail: "Tighter lists and tables for operations-heavy teams", active: false },
];
