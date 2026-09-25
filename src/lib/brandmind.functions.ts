import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { STAGE_MAP, type StageId } from "./stages";

const inputSchema = z.object({
  stage: z.string(),
  idea: z.string(),
  meta: z.record(z.string(), z.string()).optional(),
  dna: z.record(z.string(), z.unknown()).optional(),
  note: z.string().optional(),
});

function extractJson(text: string): Record<string, unknown> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI stage returned no structured result.");
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

export const runStage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const stage = STAGE_MAP[data.stage as StageId];
    if (!stage || !stage.ai) throw new Error("Unknown stage.");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project yet.");

    const inheritedEntries = Object.entries(data.dna ?? {}).filter(([key]) =>
      stage.inherits.length === 0 ? false : stage.inherits.includes(key),
    );
    const inherited = Object.fromEntries(inheritedEntries);

    const metaLines = Object.entries(data.meta ?? {})
      .filter(([, v]) => v)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    const system = [
      "You are the reasoning engine inside BRANDMIND, an AI brand intelligence studio.",
      "You run ONE stage of a ten-stage pipeline for a non-technical founder.",
      "You must build strictly on the inherited Brand DNA supplied to you and never restart reasoning from the raw idea.",
      "Be specific, opinionated and concrete. Avoid buzzwords, filler and generic startup language.",
      "Respond with a single JSON object and nothing else. No prose, no markdown fences.",
    ].join(" ");

    const prompt = [
      `STAGE: ${stage.label} (${stage.id})`,
      `STAGE PURPOSE: ${stage.purpose}`,
      "",
      "FOUNDER'S ROUGH IDEA:",
      data.idea,
      metaLines ? `\nOPTIONAL DETAILS:\n${metaLines}` : "",
      "",
      stage.inherits.length
        ? `INHERITED BRAND DNA (produced by earlier stages — build on this, do not contradict it):\n${JSON.stringify(inherited, null, 2)}`
        : "This is the first stage; there is no inherited Brand DNA yet.",
      data.note ? `\nFOUNDER DIRECTION FOR THIS RUN: ${data.note}` : "",
      "",
      `TASK: ${stage.instruction}`,
      "",
      `Return JSON exactly matching this shape (same keys, same types):\n${stage.shape}`,
      "Keep every string under 40 words. Keep arrays to the counts requested.",
    ]
      .filter(Boolean)
      .join("\n");

    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const result = streamText({
      model: openai.responses("openai/gpt-6-astra"),
      system,
      prompt,
      maxRetries: 1,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const text = await result.text;
    const output = extractJson(text);
    return { stage: stage.id, output, inherited: Object.keys(inherited) };
  });
