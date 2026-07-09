import { env } from "@/lib/env";

export type AiPromptType =
  | "dashboard_summary"
  | "workspace_update"
  | "follow_up"
  | "review_helper"
  | "billing_insights";

type GenerateAiTextInput = {
  promptType: AiPromptType;
  inputSummary: string;
};

type GenerateAiTextResult = {
  modelUsed?: string;
  outputText: string;
  usedFallback: boolean;
};

const FREE_MODEL_ID = "openrouter/free";

function getConfiguredModel() {
  return env.OPENROUTER_MODEL?.trim() || FREE_MODEL_ID;
}

function buildSystemPrompt(promptType: AiPromptType) {
  const shared =
    "You are an embedded assistant inside a premium agency client portal. Be concise, specific, polished, and human. Avoid robotic wording, filler, markdown headings, and exaggerated claims.";

  if (promptType === "follow_up") {
    return `${shared} Write a ready-to-send follow-up message in plain text. Keep it warm, clear, and professional.`;
  }

  return `${shared} Return short, useful plain-text output with compact lines that fit naturally into SaaS cards.`;
}

function buildUserPrompt(promptType: AiPromptType, inputSummary: string) {
  if (promptType === "dashboard_summary") {
    return `Using the organization summary below, write exactly 3 short lines:
- one overall status line
- one risk or bottleneck line
- one recommended next-step line

Organization context:
${inputSummary}`;
  }

  if (promptType === "workspace_update") {
    return `Using the workspace context below, draft a concise client-facing update with 3 short paragraphs:
1. progress update
2. current focus or blocker
3. immediate next step

Workspace context:
${inputSummary}`;
  }

  if (promptType === "follow_up") {
    return `Using the conversation context below, draft a client follow-up email in plain text.
Keep it under 170 words and include:
- a brief recap
- the next actions
- a friendly close

Conversation context:
${inputSummary}`;
  }

  if (promptType === "review_helper") {
    return `Using the approvals and files context below, write exactly 3 short review-helper lines:
- what is waiting
- what is missing or risky
- what should happen next

Review context:
${inputSummary}`;
  }

  return `Using the billing context below, write exactly 3 short finance insight lines:
- revenue or collection status
- overdue or risk note
- operational recommendation

Billing context:
${inputSummary}`;
}

function normalizeAiOutput(text: string) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function buildFallbackOutput(promptType: AiPromptType, inputSummary: string) {
  const lines = inputSummary
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const pick = (index: number, fallback: string) => lines[index] ?? fallback;

  if (promptType === "follow_up") {
    return normalizeAiOutput(`Thanks again for the latest review. ${pick(0, "We now have a clearer picture of the current status and near-term priorities.")}\n\nOur immediate focus is ${pick(1, "tightening the most time-sensitive deliverables and resolving any open review points before the next handoff.")}\n\nWe’ll keep momentum on ${pick(2, "the next round of deliverables and confirm any decisions that need your signoff.")} Let us know if you want us to prioritize anything differently before the next update.`);
  }

  if (promptType === "workspace_update") {
    return normalizeAiOutput(`${pick(0, "Progress is moving steadily and the workspace now reflects the latest delivery status.")}\n${pick(1, "The main focus right now is keeping approvals and active tasks aligned so the next handoff stays clean.")}\n${pick(2, "Next step: finalize the current review items and move the most ready deliverables forward.")}`);
  }

  if (promptType === "review_helper") {
    return normalizeAiOutput(`Waiting: ${pick(0, "there are active review items that still need attention.")}\nRisk: ${pick(1, "a few assets or decisions may still be slowing final approval.")}\nNext: ${pick(2, "bundle the open items clearly and assign the next reviewer or owner.")}`);
  }

  if (promptType === "billing_insights") {
    return normalizeAiOutput(`${pick(0, "Revenue visibility is healthy enough to keep priorities clear this week.")}\n${pick(1, "The main billing risk is any due or overdue balance that lingers without follow-up.")}\n${pick(2, "Best next move: close the nearest invoice conversations before new scope adds more noise.")}`);
  }

  return normalizeAiOutput(`${pick(0, "The organization is active and operationally healthy overall.")}\n${pick(1, "The clearest bottleneck is where approvals and in-progress work start to stack up.")}\n${pick(2, "Recommended next step: push the most time-sensitive review items over the line first.")}`);
}

async function requestOpenRouterCompletion(
  model: string,
  promptType: AiPromptType,
  inputSummary: string,
) {
  if (!env.OPENROUTER_API_KEY) {
    return null;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      ...(env.NEXT_PUBLIC_APP_URL
        ? {
            "HTTP-Referer": env.NEXT_PUBLIC_APP_URL,
          }
        : {}),
      "X-Title": "AgencyFlow AI",
    },
    body: JSON.stringify({
      max_tokens: 350,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(promptType),
        },
        {
          role: "user",
          content: buildUserPrompt(promptType, inputSummary),
        },
      ],
      model,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`OpenRouter request failed with status ${response.status}: ${responseText}`);
  }

  const json = (await response.json()) as {
    model?: string;
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const output = json.choices?.[0]?.message?.content?.trim();
  return output
    ? {
        modelUsed: json.model ?? model,
        outputText: normalizeAiOutput(output),
      }
    : null;
}

async function requestOpenRouterText(promptType: AiPromptType, inputSummary: string) {
  const configuredModel = getConfiguredModel();

  try {
    return await requestOpenRouterCompletion(configuredModel, promptType, inputSummary);
  } catch (error) {
    if (configuredModel === FREE_MODEL_ID) {
      throw error;
    }

    return requestOpenRouterCompletion(FREE_MODEL_ID, promptType, inputSummary);
  }
}

export async function generateAiText({
  promptType,
  inputSummary,
}: GenerateAiTextInput): Promise<GenerateAiTextResult> {
  try {
    const remoteOutput = await requestOpenRouterText(promptType, inputSummary);

    if (remoteOutput) {
      return {
        modelUsed: remoteOutput.modelUsed,
        outputText: remoteOutput.outputText,
        usedFallback: false,
      };
    }
  } catch {
    // If the provider fails, we fall back to a deterministic local draft so the UI still works.
  }

  return {
    outputText: buildFallbackOutput(promptType, inputSummary),
    usedFallback: true,
  };
}

export function splitAiText(outputText: string) {
  return outputText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}
