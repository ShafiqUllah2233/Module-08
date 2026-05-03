// Centralized mock data for the Dispute Resolution module.
// In production these will be replaced with REST API calls
// (per SRS section 2.1 and 3.3 — shared PostgreSQL DB + REST endpoints).

export const STATUSES = {
  OPEN: "Open",
  AWAITING: "Awaiting Review",
  MEDIATION: "In Mediation",
  ARBITRATION: "In Arbitration",
  RESOLVED: "Resolved",
};

export const DISPUTE_TYPES = [
  "Non Payment",
  "Poor Quality",
  "Scope Violation",
  "Misconduct",
  "Other",
];

// Top-level KPIs shown on the disputes list page
export const summary = {
  open: 3,
  inMediation: 1,
  inArbitration: 1,
  resolved: 12,
};

// KPIs shown on the Admin Resolution Queue page
export const adminQueueSummary = {
  totalOpen: 24,
  awaitingReview: 8,
  inMediation: 12,
  pendingArbitration: 4,
};

// Admin staff profiles managed via the Admin Profiles page
export const ADMIN_ROLES = {
  SUPER_ADMIN: "Super Admin",
  ARBITER: "Arbiter",
  MODERATOR: "Moderator",
};

export const adminProfiles = [
  {
    id: "ADM-001",
    name: "Admin Sarah",
    email: "sarah@nexus.com",
    role: ADMIN_ROLES.SUPER_ADMIN,
    active: true,
    created: "2022-01-15",
  },
  {
    id: "ADM-002",
    name: "Admin Mike",
    email: "mike@nexus.com",
    role: ADMIN_ROLES.ARBITER,
    active: true,
    created: "2022-06-22",
  },
  {
    id: "ADM-003",
    name: "Admin John",
    email: "john@nexus.com",
    role: ADMIN_ROLES.MODERATOR,
    active: false,
    created: "2023-03-10",
  },
];

// Current logged-in user (used by Profile + header avatar)
export const currentUser = {
  initials: "PR",
  name: "Alex Profile",
  role: "Client",
  email: "alex.profile@example.com",
  joined: "March 2022",
  totalDisputes: 4,
  resolvedCases: 3,
  trustScore: 100,
};

// Languages exposed on the Settings page
export const LANGUAGE_OPTIONS = [
  "English (US)",
  "English (UK)",
  "اردو (Urdu)",
  "Español",
  "Français",
];

// Single source of truth for disputes; pages read/write from here
export const disputes = [
  {
    id: "DSP-2023-001",
    project: "E-commerce Website Redesign",
    contractId: "CTR-2023-889",
    type: "Non Payment",
    status: STATUSES.MEDIATION,
    assignedTo: "Admin Sarah",
    created: "2023-10-12",
    updated: "2023-10-15",
    filedOn: "2023-10-12",
    description:
      "The freelancer was hired to redesign the e-commerce website and deliver the final files by Oct 1st. They missed the deadline and after two extensions, they stopped responding entirely. The escrow is currently locked but they are refusing to cancel the contract or deliver the work. I would like a full refund of the escrowed amount.",
    parties: {
      complainant: { initials: "AS", name: "Alice Smith", role: "Complainant (Client)" },
      respondent: { initials: "BJ", name: "Bob Jones", role: "Respondent (Freelancer)" },
    },
    payment: {
      escrow: 2500,
      status: "Escrow Locked",
      contractStatus: "On Hold",
    },
    evidence: [
      { name: "contract_agreement.pdf", size: "2.4 MB", uploadedBy: "Alice Smith", hidden: false },
      { name: "email_chain.png", size: "845 KB", uploadedBy: "Alice Smith", hidden: false },
      { name: "final_delivery.zip", size: "14.2 MB", uploadedBy: "Bob Jones", hidden: true },
    ],
    timeline: [
      { ts: "2023-10-12 09:15 AM", title: "Status changed to Open", actor: "Alice Smith", from: "Draft", to: "Open" },
      { ts: "2023-10-12 09:16 AM", title: "Status changed to Awaiting Review", actor: "System", from: "Open", to: "Awaiting Review" },
      { ts: "2023-10-13 11:00 AM", title: "Status changed to In Mediation", actor: "Admin Sarah", from: "Awaiting Review", to: "In Mediation" },
    ],
    mediation: {
      deadline: "October 20, 2023",
      daysRemaining: 4,
      status: "Active",
      log: [
        {
          author: "Alice Smith",
          ts: "2023-10-13 10:00 AM",
          text: "The freelancer missed the deadline by 2 weeks and stopped responding.",
          self: true,
        },
        {
          author: "Bob Jones",
          ts: "2023-10-14 02:30 PM",
          text: "I had a family emergency, but I delivered the work yesterday.",
          self: false,
        },
        {
          system: true,
          ts: "2023-10-15 09:00 AM",
          text: "Mediation period extended by 3 days.",
        },
      ],
    },
  },
  {
    id: "DSP-2023-002",
    project: "Mobile App Development",
    contractId: "CTR-2023-902",
    type: "Poor Quality",
    status: STATUSES.OPEN,
    assignedTo: null,
    created: "2023-10-14",
    updated: "2023-10-14",
    filedOn: "2023-10-14",
    description:
      "Delivered build crashes on launch and does not match the agreed Figma specification.",
    parties: {
      complainant: { initials: "CD", name: "Charlie Davis", role: "Complainant (Client)" },
      respondent: { initials: "DW", name: "Dana White", role: "Respondent (Freelancer)" },
    },
    payment: { escrow: 4800, status: "Escrow Locked", contractStatus: "On Hold" },
    evidence: [],
    timeline: [
      { ts: "2023-10-14 10:00 AM", title: "Status changed to Open", actor: "John Davis", from: "Draft", to: "Open" },
    ],
    mediation: null,
  },
  {
    id: "DSP-2023-003",
    project: "Logo & Brand Identity",
    contractId: "CTR-2023-815",
    type: "Scope Violation",
    status: STATUSES.ARBITRATION,
    assignedTo: "Admin Mike",
    created: "2023-10-05",
    updated: "2023-10-16",
    filedOn: "2023-10-05",
    description:
      "Client kept requesting changes far beyond the scope of work without offering additional compensation.",
    parties: {
      complainant: { initials: "EB", name: "Eve Black", role: "Complainant (Freelancer)" },
      respondent: { initials: "FG", name: "Frank Green", role: "Respondent (Client)" },
    },
    payment: { escrow: 950, status: "Escrow Locked", contractStatus: "On Hold" },
    evidence: [],
    timeline: [
      { ts: "2023-10-05 09:00 AM", title: "Status changed to Open", actor: "Rachel Lee", from: "Draft", to: "Open" },
      { ts: "2023-10-09 02:00 PM", title: "Status changed to In Mediation", actor: "Admin Sarah", from: "Open", to: "In Mediation" },
      { ts: "2023-10-16 10:30 AM", title: "Status changed to In Arbitration", actor: "System", from: "In Mediation", to: "In Arbitration" },
    ],
    mediation: null,
  },
  {
    id: "DSP-2023-004",
    project: "SEO Optimization",
    contractId: "CTR-2023-770",
    type: "Misconduct",
    status: STATUSES.RESOLVED,
    assignedTo: "Admin Sarah",
    created: "2023-09-20",
    updated: "2023-09-28",
    filedOn: "2023-09-20",
    description: "Resolved in favour of the client after evidence review.",
    parties: {
      complainant: { initials: "GL", name: "Grace Lee", role: "Complainant (Client)" },
      respondent: { initials: "HF", name: "Henry Ford", role: "Respondent (Freelancer)" },
    },
    payment: { escrow: 1200, status: "Released", contractStatus: "Closed" },
    evidence: [],
    timeline: [
      { ts: "2023-09-20 09:00 AM", title: "Status changed to Open", actor: "Priya Ahmed", from: "Draft", to: "Open" },
      { ts: "2023-09-28 04:00 PM", title: "Status changed to Resolved", actor: "Admin Sarah", from: "In Arbitration", to: "Resolved" },
    ],
    mediation: null,
  },
  {
    id: "DSP-2023-005",
    project: "Copywriting for Blog",
    contractId: "CTR-2023-655",
    type: "Other",
    status: STATUSES.AWAITING,
    assignedTo: null,
    created: "2023-10-16",
    updated: "2023-10-16",
    filedOn: "2023-10-16",
    description: "Pending administrator triage.",
    parties: {
      complainant: { initials: "IC", name: "Ivy Chen", role: "Complainant (Client)" },
      respondent: { initials: "JB", name: "Jack Brown", role: "Respondent (Freelancer)" },
    },
    payment: { escrow: 300, status: "Escrow Locked", contractStatus: "On Hold" },
    evidence: [],
    timeline: [
      { ts: "2023-10-16 09:00 AM", title: "Status changed to Open", actor: "Eva Vance", from: "Draft", to: "Open" },
      { ts: "2023-10-16 09:01 AM", title: "Status changed to Awaiting Review", actor: "System", from: "Open", to: "Awaiting Review" },
    ],
    mediation: null,
  },
];

export function getDisputeById(id) {
  return disputes.find((d) => d.id === id);
}

// Possible outcomes an admin can issue at the arbitration step.
// FR-DR-23: Resolution outcome selection.
export const ARBITRATION_OUTCOMES = [
  {
    id: "favour-client",
    title: "Favour Client (Complainant)",
    subtitle: "Full refund of escrow to the client.",
    label: "FAVOUR CLIENT (Full Refund)",
  },
  {
    id: "favour-freelancer",
    title: "Favour Freelancer (Respondent)",
    subtitle: "Full release of escrow to the freelancer.",
    label: "FAVOUR FREELANCER (Full Release)",
  },
  {
    id: "split",
    title: "Split Decision",
    subtitle: "Partial refund and partial release.",
    label: "SPLIT DECISION",
  },
  {
    id: "dismissed",
    title: "Case Dismissed",
    subtitle: "No action taken. Parties must resolve externally.",
    label: "CASE DISMISSED",
  },
];

// Pre-canned report copy for the resolution report screen.
// In production this would be generated server-side from the
// arbitration record (FR-DR-28..30).
export const SAMPLE_REPORT_BODY = `After a thorough review of the evidence submitted by both parties, the arbitration panel has concluded the following:

1. The agreed upon deadline of October 1st was missed by the respondent without sufficient prior notice.
2. The extensions granted by the complainant were not utilized to deliver the final work.
3. The respondent ceased communication on October 10th.

As the scope of work was not completed and the terms of the contract were violated, a full refund of the escrowed amount ($2,500.00) will be returned to the client.`;

// Immutable record shown on the System Audit Log page (FR-DR-36).
export const auditLog = [
  {
    ts: "2023-10-16 14:22:00",
    admin: "Admin Sarah",
    actionType: "Status Change",
    entityType: "Dispute",
    targetId: "DSP-2023-004",
    details: "Changed status to Resolved",
  },
  {
    ts: "2023-10-16 10:05:00",
    admin: "Admin Mike",
    actionType: "Assigned",
    entityType: "Dispute",
    targetId: "DSP-2023-003",
    details: "Assigned self to dispute",
  },
  {
    ts: "2023-10-15 16:40:00",
    admin: "Admin Sarah",
    actionType: "Note Added",
    entityType: "Dispute",
    targetId: "DSP-2023-001",
    details: "Added internal review note",
  },
];

export const AUDIT_ACTION_TYPES = [
  "All Actions",
  "Status Change",
  "Assigned",
  "Note Added",
  "Decision Issued",
  "Evidence Reviewed",
];

export const AUDIT_ENTITY_TYPES = ["Dispute", "Admin", "Evidence", "Mediation"];
