import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function readEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");

  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1).trim()];
      }),
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function isoDate(daysFromToday) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

const env = readEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase credentials in .env.local");
}

if (!globalThis.WebSocket) {
  globalThis.WebSocket = class WebSocketStub {};
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const targetOrgSlug = process.argv[2] ?? "cheema-studios";

async function maybeSingle(queryBuilder) {
  const { data, error } = await queryBuilder.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function listAllUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    users.push(...(data.users ?? []));

    if (!data.users || data.users.length < 200) {
      return users;
    }

    page += 1;
  }
}

async function ensureAuthUser({ email, fullName }) {
  const users = await listAllUsers();
  let user = users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: "AgencyFlowTeam123!",
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error || !data.user) {
      throw error ?? new Error(`Could not create auth user for ${email}`);
    }

    user = data.user;
  }

  let profile = await maybeSingle(
    supabase
      .from("profiles")
      .select("id, auth_user_id, full_name")
      .eq("auth_user_id", user.id),
  );

  if (!profile) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        auth_user_id: user.id,
        full_name: fullName,
      })
      .select("id, auth_user_id, full_name")
      .single();

    if (error) {
      throw error;
    }

    profile = data;
  } else if (!profile.full_name || profile.full_name !== fullName) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id)
      .select("id, auth_user_id, full_name")
      .single();

    if (error) {
      throw error;
    }

    profile = data;
  }

  return profile;
}

async function ensureOrganizationMember(organizationId, profileId, role = "team_member") {
  const existing = await maybeSingle(
    supabase
      .from("organization_members")
      .select("id, role")
      .eq("organization_id", organizationId)
      .eq("profile_id", profileId),
  );

  if (existing) {
    if (existing.role !== role) {
      const { error } = await supabase
        .from("organization_members")
        .update({ role })
        .eq("id", existing.id);

      if (error) {
        throw error;
      }
    }

    return existing.id;
  }

  const { data, error } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      profile_id: profileId,
      role,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureClient(organizationId, input) {
  const existing = await maybeSingle(
    supabase
      .from("clients")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("name", input.name),
  );

  if (existing) {
    const { data, error } = await supabase
      .from("clients")
      .update({
        contact_email: input.contact_email,
        notes: input.notes,
      })
      .eq("id", existing.id)
      .select("id, name")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      organization_id: organizationId,
      ...input,
    })
    .select("id, name")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureProject(organizationId, clientId, input) {
  const existing = await maybeSingle(
    supabase
      .from("projects")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("name", input.name),
  );

  const payload = {
    organization_id: organizationId,
    client_id: clientId,
    summary: input.summary,
    stage: input.stage,
    budget_cents: input.budget_cents,
    due_date: input.due_date,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", existing.id)
      .select("id, name")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      ...payload,
    })
    .select("id, name")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureProjectMember(projectId, profileId, role = "team_member") {
  const existing = await maybeSingle(
    supabase
      .from("project_members")
      .select("id, role")
      .eq("project_id", projectId)
      .eq("profile_id", profileId),
  );

  if (existing) {
    if (existing.role !== role) {
      const { error } = await supabase
        .from("project_members")
        .update({ role })
        .eq("id", existing.id);

      if (error) {
        throw error;
      }
    }

    return existing.id;
  }

  const { data, error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      profile_id: profileId,
      role,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureWorkspace(projectId, input) {
  const existing = await maybeSingle(
    supabase
      .from("workspaces")
      .select("id, name")
      .eq("project_id", projectId)
      .eq("name", input.name),
  );

  const payload = {
    project_id: projectId,
    stage: input.stage,
    summary: input.summary,
    client_visible: input.client_visible,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("workspaces")
      .update(payload)
      .eq("id", existing.id)
      .select("id, name")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: input.name,
      ...payload,
    })
    .select("id, name")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureMilestone(workspaceId, input) {
  const existing = await maybeSingle(
    supabase
      .from("milestones")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("name", input.name),
  );

  const payload = {
    workspace_id: workspaceId,
    status: input.status,
    due_date: input.due_date,
  };

  if (existing) {
    const { error } = await supabase.from("milestones").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      name: input.name,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureTask(workspaceId, input) {
  const existing = await maybeSingle(
    supabase
      .from("tasks")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("title", input.title),
  );

  const payload = {
    workspace_id: workspaceId,
    description: input.description,
    state: input.state,
    assignee_profile_id: input.assignee_profile_id,
    due_date: input.due_date,
    client_visible: input.client_visible,
  };

  if (existing) {
    const { error } = await supabase.from("tasks").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureMeetingNote(workspaceId, input) {
  const existing = await maybeSingle(
    supabase
      .from("meeting_notes")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("title", input.title),
  );

  const payload = {
    workspace_id: workspaceId,
    summary: input.summary,
    created_by: input.created_by,
  };

  if (existing) {
    const { error } = await supabase.from("meeting_notes").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("meeting_notes")
    .insert({
      title: input.title,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureConversation(organizationId, input) {
  const existing = await maybeSingle(
    supabase
      .from("conversations")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("title", input.title),
  );

  const payload = {
    organization_id: organizationId,
    project_id: input.project_id,
    workspace_id: input.workspace_id,
  };

  if (existing) {
    const { error } = await supabase.from("conversations").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      title: input.title,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureConversationParticipant(conversationId, profileId) {
  const existing = await maybeSingle(
    supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("profile_id", profileId),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("conversation_participants")
    .insert({
      conversation_id: conversationId,
      profile_id: profileId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureMessage(conversationId, input) {
  const existing = await maybeSingle(
    supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("body", input.body),
  );

  const payload = {
    conversation_id: conversationId,
    author_profile_id: input.author_profile_id,
    internal_only: input.internal_only,
  };

  if (existing) {
    const { error } = await supabase.from("messages").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      body: input.body,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureFile(workspaceId, input) {
  const existing = await maybeSingle(
    supabase
      .from("files")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("name", input.name),
  );

  const payload = {
    workspace_id: workspaceId,
    uploaded_by: input.uploaded_by,
    storage_path: input.storage_path,
    file_type: input.file_type,
    status: input.status,
  };

  if (existing) {
    const { error } = await supabase.from("files").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("files")
    .insert({
      name: input.name,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureFileVersion(fileId, input) {
  const existing = await maybeSingle(
    supabase
      .from("file_versions")
      .select("id")
      .eq("file_id", fileId)
      .eq("version_label", input.version_label),
  );

  const payload = {
    file_id: fileId,
    storage_path: input.storage_path,
    uploaded_by: input.uploaded_by,
  };

  if (existing) {
    const { error } = await supabase.from("file_versions").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("file_versions")
    .insert({
      version_label: input.version_label,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureApprovalRequest(workspaceId, input) {
  const existing = await maybeSingle(
    supabase
      .from("approval_requests")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("title", input.title),
  );

  const payload = {
    workspace_id: workspaceId,
    file_version_id: input.file_version_id,
    requested_by: input.requested_by,
    state: input.state,
    due_date: input.due_date,
  };

  if (existing) {
    const { error } = await supabase
      .from("approval_requests")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("approval_requests")
    .insert({
      title: input.title,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureApprovalReviewer(approvalRequestId, profileId) {
  const existing = await maybeSingle(
    supabase
      .from("approval_reviewers")
      .select("id")
      .eq("approval_request_id", approvalRequestId)
      .eq("profile_id", profileId),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("approval_reviewers")
    .insert({
      approval_request_id: approvalRequestId,
      profile_id: profileId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureInvoice(organizationId, input) {
  const existing = await maybeSingle(
    supabase
      .from("invoices")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("invoice_number", input.invoice_number),
  );

  const payload = {
    organization_id: organizationId,
    client_id: input.client_id,
    project_id: input.project_id,
    status: input.status,
    amount_cents: input.amount_cents,
    due_date: input.due_date,
    issued_at: input.issued_at,
  };

  if (existing) {
    const { error } = await supabase.from("invoices").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      invoice_number: input.invoice_number,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensurePayment(invoiceId, input) {
  const existing = await maybeSingle(
    supabase
      .from("payments")
      .select("id")
      .eq("invoice_id", invoiceId)
      .eq("note", input.note),
  );

  const payload = {
    invoice_id: invoiceId,
    amount_cents: input.amount_cents,
    paid_at: input.paid_at,
  };

  if (existing) {
    const { error } = await supabase.from("payments").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      note: input.note,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureActivityLog(organizationId, input) {
  const existing = await maybeSingle(
    supabase
      .from("activity_logs")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("entity_type", input.entity_type)
      .eq("action", input.action)
      .eq("entity_id", input.entity_id),
  );

  const payload = {
    organization_id: organizationId,
    profile_id: input.profile_id,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    details: input.details,
  };

  if (existing) {
    const { error } = await supabase.from("activity_logs").update(payload).eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .insert({
      action: input.action,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

const teamSeeds = [
  { email: "maya@cheemastudios.co", fullName: "Maya Foster", role: "team_member" },
  { email: "rehan@cheemastudios.co", fullName: "Rehan Malik", role: "team_member" },
  { email: "zara@cheemastudios.co", fullName: "Zara Hussain", role: "team_member" },
];

const clientSeeds = [
  {
    name: "Northshore Wellness",
    contact_email: "nina@northshorewellness.com",
    notes: "Monthly site, SEO, and campaign support for a fast-moving clinic team.",
  },
  {
    name: "Atlas Partners",
    contact_email: "ian@atlaspartners.co",
    notes: "Investor-facing materials and landing page cleanup ahead of partner outreach.",
  },
  {
    name: "Cedar Labs",
    contact_email: "sara@cedarlabs.io",
    notes: "Growth messaging, paid acquisition creative, and lifecycle email iteration.",
  },
  {
    name: "Harbor Dental",
    contact_email: "ops@harbordental.ca",
    notes: "Booking funnel, service page refresh, and patient handoff improvements.",
  },
  {
    name: "Solstice Pilates",
    contact_email: "hello@solsticepilates.com",
    notes: "Launch support for a new studio with paid social and email sequencing.",
  },
  {
    name: "Kindred Kitchen",
    contact_email: "maria@kindredkitchen.co",
    notes: "Catering site polish, menu storytelling, and seasonal content updates.",
  },
  {
    name: "Elm Health",
    contact_email: "care@elmhealth.app",
    notes: "Mobile product launch planning and feature rollout positioning.",
  },
];

const projectSeeds = [
  {
    name: "Elm mobile app",
    client: "Elm Health",
    stage: "backlog",
    budget_cents: 500000,
    due_date: isoDate(104),
    summary: "Foundational product build covering onboarding, accessibility, and daily-use flows.",
    workspaces: [
      {
        name: "Cheema Studio workspace",
        stage: "backlog",
        client_visible: true,
        summary: "Early planning hub for launch scope, research notes, and shared decisions.",
        milestones: [
          { name: "Finalize MVP scope", status: "In review", due_date: isoDate(10) },
          { name: "Approve onboarding wireframes", status: "Queued", due_date: isoDate(18) },
        ],
        tasks: [
          {
            title: "Clean up accessibility feature outline",
            description: "Turn the current rough notes into a stakeholder-safe product brief.",
            state: "in_progress",
            assignee: "Maya Foster",
            due_date: isoDate(4),
            client_visible: true,
          },
          {
            title: "Define v1 indoor navigation success criteria",
            description: "Agree on what counts as a useful first release before development estimates.",
            state: "todo",
            assignee: "Hamza Cheema",
            due_date: isoDate(7),
            client_visible: true,
          },
        ],
        files: [
          {
            name: "AdaptiveIndoorAccessibilityAI.pdf",
            file_type: "application/pdf",
            status: "pending_review",
            version_label: "v1",
            approval: {
              title: "Review MVP accessibility brief",
              state: "pending_review",
              due_date: isoDate(5),
              reviewers: ["Maya Foster"],
            },
          },
        ],
        notes: [
          {
            title: "Founder sync recap",
            summary: "Need to keep the first release lean, but the wayfinding story still has to feel credible and human.",
            created_by: "Hamza Cheema",
          },
        ],
        conversation: {
          title: "Elm product planning thread",
          messages: [
            { author: "Hamza Cheema", body: "I want the product scope to stay lean, but not feel stripped down.", internal_only: false },
            { author: "Maya Foster", body: "I’ll tighten the brief and separate must-have accessibility wins from later stretch ideas.", internal_only: false },
          ],
        },
      },
    ],
  },
  {
    name: "Northshore Website Retainer",
    client: "Northshore Wellness",
    stage: "in_progress",
    budget_cents: 1280000,
    due_date: isoDate(26),
    summary: "Homepage, local SEO, and monthly promo support for a clinic pushing steady growth.",
    workspaces: [
      {
        name: "Homepage refresh workspace",
        stage: "in_progress",
        client_visible: true,
        summary: "Hero, service hierarchy, and trust-building updates for the summer push.",
        milestones: [
          { name: "Approve refreshed hero copy", status: "Needs review", due_date: isoDate(6) },
          { name: "Ship testimonial layout", status: "In motion", due_date: isoDate(11) },
        ],
        tasks: [
          {
            title: "Refine testimonial hierarchy for mobile",
            description: "Make the social proof block easier to scan on smaller screens.",
            state: "ready",
            assignee: "Rehan Malik",
            due_date: isoDate(2),
            client_visible: true,
          },
          {
            title: "Publish updated service FAQs",
            description: "Carry the revised FAQs into the live CMS after legal copy signoff.",
            state: "todo",
            assignee: "Zara Hussain",
            due_date: isoDate(8),
            client_visible: true,
          },
        ],
        files: [
          {
            name: "northshore-homepage-v4.fig",
            file_type: "application/figma",
            status: "approved",
            version_label: "v4",
            approval: {
              title: "Homepage v4 visual approval",
              state: "approved",
              due_date: isoDate(-1),
              reviewers: ["Zara Hussain"],
            },
          },
          {
            name: "northshore-copy-round-2.docx",
            file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            status: "needs_changes",
            version_label: "v2",
            approval: {
              title: "Homepage copy round 2",
              state: "needs_changes",
              due_date: isoDate(3),
              reviewers: ["Maya Foster"],
            },
          },
        ],
        notes: [
          {
            title: "Weekly review recap",
            summary: "Client likes the calmer layout direction but wants stronger CTA language above the fold.",
            created_by: "Zara Hussain",
          },
        ],
        conversation: {
          title: "Northshore weekly review",
          messages: [
            { author: "Zara Hussain", body: "Northshore likes the new structure, but they want the CTA to feel more direct.", internal_only: false },
            { author: "Rehan Malik", body: "I can rebalance the hero spacing and get a sharper CTA version in today.", internal_only: false },
            { author: "Maya Foster", body: "Let’s keep the trust section visible above the fold on tablet too.", internal_only: true },
          ],
        },
      },
      {
        name: "July content approvals",
        stage: "review",
        client_visible: true,
        summary: "Blog, email, and social approvals for the current monthly content batch.",
        milestones: [
          { name: "Blog pack signoff", status: "Awaiting approval", due_date: isoDate(4) },
        ],
        tasks: [
          {
            title: "Bundle IG captions with blog snippets",
            description: "Keep the monthly content review inside one consolidated packet.",
            state: "in_progress",
            assignee: "Maya Foster",
            due_date: isoDate(1),
            client_visible: true,
          },
        ],
        files: [
          {
            name: "northshore-july-content-pack.pdf",
            file_type: "application/pdf",
            status: "pending_review",
            version_label: "v1",
            approval: {
              title: "July content packet",
              state: "pending_review",
              due_date: isoDate(2),
              reviewers: ["Zara Hussain", "Maya Foster"],
            },
          },
        ],
      },
    ],
  },
  {
    name: "Atlas Investor Deck Refresh",
    client: "Atlas Partners",
    stage: "review",
    budget_cents: 940000,
    due_date: isoDate(13),
    summary: "Board-deck cleanup, message tightening, and a more premium financial narrative.",
    workspaces: [
      {
        name: "Board deck v3",
        stage: "review",
        client_visible: true,
        summary: "Final polish pass for investor narrative and visual consistency.",
        milestones: [
          { name: "Partner comments resolved", status: "In review", due_date: isoDate(3) },
        ],
        tasks: [
          {
            title: "Trim the market opportunity slide",
            description: "Reduce repetition and make the proof points easier to trust quickly.",
            state: "ready",
            assignee: "Rehan Malik",
            due_date: isoDate(1),
            client_visible: true,
          },
          {
            title: "Check revised metrics footnotes",
            description: "Confirm the latest quarter references line up with the numbers in the appendix.",
            state: "blocked",
            assignee: "Hamza Cheema",
            due_date: isoDate(2),
            client_visible: false,
          },
        ],
        files: [
          {
            name: "atlas-board-deck-v3.pptx",
            file_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            status: "pending_review",
            version_label: "v3",
            approval: {
              title: "Investor deck v3 signoff",
              state: "pending_review",
              due_date: isoDate(2),
              reviewers: ["Maya Foster", "Rehan Malik"],
            },
          },
        ],
        notes: [
          {
            title: "Partner prep call",
            summary: "The story is strong now; the last pass is mostly about confidence, pacing, and keeping the deck lighter.",
            created_by: "Maya Foster",
          },
        ],
        conversation: {
          title: "Atlas deck revisions",
          messages: [
            { author: "Maya Foster", body: "Atlas wants the before-and-after traction slide to land faster.", internal_only: false },
            { author: "Hamza Cheema", body: "Let’s simplify the proof points instead of stacking more text.", internal_only: true },
          ],
        },
      },
    ],
  },
  {
    name: "Cedar Growth Sprint",
    client: "Cedar Labs",
    stage: "in_progress",
    budget_cents: 760000,
    due_date: isoDate(19),
    summary: "Four-week sprint covering landing page updates, lead capture, and email nurture cleanup.",
    workspaces: [
      {
        name: "Growth sprint",
        stage: "in_progress",
        client_visible: true,
        summary: "Channel coordination workspace for landing pages, email, and paid hooks.",
        milestones: [
          { name: "Lead magnet copy locked", status: "In motion", due_date: isoDate(5) },
          { name: "Email nurture draft approved", status: "Queued", due_date: isoDate(9) },
        ],
        tasks: [
          {
            title: "Rewrite top-of-funnel lead magnet opener",
            description: "The current headline is too generic for a technical buyer audience.",
            state: "in_progress",
            assignee: "Zara Hussain",
            due_date: isoDate(3),
            client_visible: true,
          },
          {
            title: "Package the paid social test matrix",
            description: "Put hooks, visuals, and landing page pairings in one reviewable sheet.",
            state: "todo",
            assignee: "Maya Foster",
            due_date: isoDate(6),
            client_visible: false,
          },
        ],
        files: [
          {
            name: "cedar-growth-hooks.xlsx",
            file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            status: "approved",
            version_label: "v1",
            approval: {
              title: "Growth hooks matrix",
              state: "approved",
              due_date: isoDate(-2),
              reviewers: ["Zara Hussain"],
            },
          },
        ],
      },
    ],
  },
  {
    name: "Harbor Booking Revamp",
    client: "Harbor Dental",
    stage: "approved",
    budget_cents: 610000,
    due_date: isoDate(8),
    summary: "Smoother booking flow and clearer treatment pages before the paid search rollout.",
    workspaces: [
      {
        name: "Booking funnel revamp",
        stage: "approved",
        client_visible: true,
        summary: "Approved UX updates for booking friction, FAQs, and treatment CTAs.",
        milestones: [
          { name: "Implementation handoff", status: "Approved", due_date: isoDate(4) },
        ],
        tasks: [
          {
            title: "Prepare dev handoff notes",
            description: "Capture the approval decisions so implementation does not guess at the details.",
            state: "done",
            assignee: "Rehan Malik",
            due_date: isoDate(1),
            client_visible: true,
          },
        ],
        files: [
          {
            name: "harbor-booking-flow-final.pdf",
            file_type: "application/pdf",
            status: "approved",
            version_label: "v5",
            approval: {
              title: "Booking funnel final approval",
              state: "approved",
              due_date: isoDate(-3),
              reviewers: ["Maya Foster"],
            },
          },
        ],
      },
    ],
  },
  {
    name: "Solstice Launch Campaign",
    client: "Solstice Pilates",
    stage: "delivered",
    budget_cents: 870000,
    due_date: isoDate(-6),
    summary: "Studio opening campaign with launch email, paid social, and class booking push.",
    workspaces: [
      {
        name: "Launch assets and social",
        stage: "delivered",
        client_visible: true,
        summary: "Delivered launch packet and handoff materials for the opening week campaign.",
        milestones: [
          { name: "Launch campaign delivered", status: "Complete", due_date: isoDate(-6) },
        ],
        tasks: [
          {
            title: "Archive final paid creative set",
            description: "Keep the final exports tidy so future seasonal edits are easy to reopen.",
            state: "done",
            assignee: "Zara Hussain",
            due_date: isoDate(-4),
            client_visible: false,
          },
        ],
        files: [
          {
            name: "solstice-launch-asset-pack.zip",
            file_type: "application/zip",
            status: "archived",
            version_label: "v1",
            approval: {
              title: "Launch asset archive",
              state: "archived",
              due_date: isoDate(-5),
              reviewers: ["Zara Hussain"],
            },
          },
        ],
      },
    ],
  },
  {
    name: "Kindred Catering Site Polish",
    client: "Kindred Kitchen",
    stage: "backlog",
    budget_cents: 430000,
    due_date: isoDate(31),
    summary: "Menu storytelling, event inquiry cleanup, and seasonal visual refresh planning.",
    workspaces: [
      {
        name: "Menu photography and site polish",
        stage: "backlog",
        client_visible: true,
        summary: "Backlog workspace for menu presentation, image planning, and inquiry flow fixes.",
        milestones: [
          { name: "Photography brief approved", status: "Planned", due_date: isoDate(12) },
        ],
        tasks: [
          {
            title: "Sketch the new catering inquiry path",
            description: "Clarify what a first-time visitor should do when they need a quote fast.",
            state: "todo",
            assignee: "Hamza Cheema",
            due_date: isoDate(10),
            client_visible: true,
          },
        ],
      },
    ],
  },
];

const invoiceSeeds = [
  { invoice_number: "AF-1041", client: "Northshore Wellness", project: "Northshore Website Retainer", status: "due", amount_cents: 320000, issued_at: isoDate(-7), due_date: isoDate(5) },
  { invoice_number: "AF-1042", client: "Atlas Partners", project: "Atlas Investor Deck Refresh", status: "draft", amount_cents: 180000, issued_at: isoDate(-2), due_date: isoDate(12) },
  { invoice_number: "AF-1043", client: "Harbor Dental", project: "Harbor Booking Revamp", status: "paid", amount_cents: 610000, issued_at: isoDate(-18), due_date: isoDate(-8), payment_note: "Paid in full by ACH", paid_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { invoice_number: "AF-1044", client: "Cedar Labs", project: "Cedar Growth Sprint", status: "overdue", amount_cents: 240000, issued_at: isoDate(-21), due_date: isoDate(-3) },
];

async function main() {
  const organization = await maybeSingle(
    supabase
      .from("organizations")
      .select("id, name, slug, created_by")
      .eq("slug", targetOrgSlug),
  );

  if (!organization) {
    throw new Error(`Could not find organization with slug ${targetOrgSlug}`);
  }

  const ownerProfile = await maybeSingle(
    supabase
      .from("profiles")
      .select("id, full_name, auth_user_id")
      .eq("auth_user_id", organization.created_by),
  );

  if (!ownerProfile) {
    throw new Error("Could not resolve the organization owner profile.");
  }

  const profileMap = new Map([[ownerProfile.full_name, ownerProfile]]);

  for (const teammate of teamSeeds) {
    const profile = await ensureAuthUser({
      email: teammate.email,
      fullName: teammate.fullName,
    });

    await ensureOrganizationMember(organization.id, profile.id, teammate.role);
    profileMap.set(teammate.fullName, profile);
  }

  await ensureOrganizationMember(organization.id, ownerProfile.id, "admin");

  const clientsByName = new Map();
  for (const client of clientSeeds) {
    const row = await ensureClient(organization.id, client);
    clientsByName.set(client.name, row);
  }

  const projectsByName = new Map();
  const workspaceCount = { total: 0 };
  const taskCount = { total: 0 };
  const approvalCount = { total: 0 };

  for (const projectSeed of projectSeeds) {
    const client = clientsByName.get(projectSeed.client);
    const project = await ensureProject(organization.id, client?.id ?? null, projectSeed);
    projectsByName.set(projectSeed.name, project);

    for (const profile of profileMap.values()) {
      await ensureProjectMember(project.id, profile.id, profile.id === ownerProfile.id ? "admin" : "team_member");
    }

    for (const workspaceSeed of projectSeed.workspaces) {
      const workspace = await ensureWorkspace(project.id, workspaceSeed);
      workspaceCount.total += 1;

      for (const milestone of workspaceSeed.milestones ?? []) {
        await ensureMilestone(workspace.id, milestone);
      }

      for (const task of workspaceSeed.tasks ?? []) {
        await ensureTask(workspace.id, {
          ...task,
          assignee_profile_id: profileMap.get(task.assignee)?.id ?? ownerProfile.id,
        });
        taskCount.total += 1;
      }

      for (const note of workspaceSeed.notes ?? []) {
        await ensureMeetingNote(workspace.id, {
          ...note,
          created_by: profileMap.get(note.created_by)?.id ?? ownerProfile.id,
        });
      }

      if (workspaceSeed.conversation) {
        const conversationId = await ensureConversation(organization.id, {
          title: workspaceSeed.conversation.title,
          project_id: project.id,
          workspace_id: workspace.id,
        });

        for (const profile of profileMap.values()) {
          await ensureConversationParticipant(conversationId, profile.id);
        }

        for (const message of workspaceSeed.conversation.messages) {
          await ensureMessage(conversationId, {
            author_profile_id: profileMap.get(message.author)?.id ?? ownerProfile.id,
            body: message.body,
            internal_only: message.internal_only,
          });
        }
      }

      for (const fileSeed of workspaceSeed.files ?? []) {
        const fileId = await ensureFile(workspace.id, {
          ...fileSeed,
          uploaded_by: ownerProfile.id,
          storage_path: `${organization.slug}/${workspace.id}/${slugify(fileSeed.name)}-${randomUUID()}`,
        });

        const versionId = await ensureFileVersion(fileId, {
          version_label: fileSeed.version_label,
          storage_path: `${organization.slug}/${workspace.id}/${slugify(fileSeed.name)}-${fileSeed.version_label}`,
          uploaded_by: ownerProfile.id,
        });

        if (fileSeed.approval) {
          const approvalId = await ensureApprovalRequest(workspace.id, {
            title: fileSeed.approval.title,
            state: fileSeed.approval.state,
            due_date: fileSeed.approval.due_date,
            file_version_id: versionId,
            requested_by: ownerProfile.id,
          });
          approvalCount.total += 1;

          for (const reviewerName of fileSeed.approval.reviewers) {
            const reviewer = profileMap.get(reviewerName);
            if (reviewer) {
              await ensureApprovalReviewer(approvalId, reviewer.id);
            }
          }
        }
      }

      await ensureActivityLog(organization.id, {
        profile_id: ownerProfile.id,
        entity_type: "workspace",
        entity_id: workspace.id,
        action: workspaceSeed.stage === "review" ? "moved_to_review" : "workspace_updated",
        details: {
          summary: workspaceSeed.summary,
          stage: workspaceSeed.stage,
        },
      });
    }

    await ensureActivityLog(organization.id, {
      profile_id: ownerProfile.id,
      entity_type: "project",
      entity_id: project.id,
      action: `${projectSeed.stage}_project`,
      details: {
        client: projectSeed.client,
        budget_cents: projectSeed.budget_cents,
      },
    });
  }

  for (const invoiceSeed of invoiceSeeds) {
    const client = clientsByName.get(invoiceSeed.client);
    const project = projectsByName.get(invoiceSeed.project);
    const invoiceId = await ensureInvoice(organization.id, {
      ...invoiceSeed,
      client_id: client?.id ?? null,
      project_id: project?.id ?? null,
    });

    if (invoiceSeed.status === "paid" && invoiceSeed.payment_note && invoiceSeed.paid_at) {
      await ensurePayment(invoiceId, {
        amount_cents: invoiceSeed.amount_cents,
        note: invoiceSeed.payment_note,
        paid_at: invoiceSeed.paid_at,
      });
    }

    await ensureActivityLog(organization.id, {
      profile_id: ownerProfile.id,
      entity_type: "invoice",
      entity_id: invoiceId,
      action: `invoice_${invoiceSeed.status}`,
      details: {
        invoice_number: invoiceSeed.invoice_number,
        amount_cents: invoiceSeed.amount_cents,
      },
    });
  }

  console.log(`Seeded organization: ${organization.name}`);
  console.log(`Clients ensured: ${clientSeeds.length}`);
  console.log(`Projects ensured: ${projectSeeds.length}`);
  console.log(`Workspaces ensured: ${workspaceCount.total}`);
  console.log(`Tasks ensured: ${taskCount.total}`);
  console.log(`Approval requests ensured: ${approvalCount.total}`);
  console.log(`Team profiles available: ${profileMap.size}`);
}

await main();
