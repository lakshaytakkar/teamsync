import type { Request, Response } from "express";
import { Router } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { supabase } from "./supabase";

const router = Router();

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const SYSTEM_PROMPT = `You are TeamSync AI — the intelligent co-pilot for the TeamSync business operations platform.

TeamSync is an internal operating system for a multi-brand enterprise with the following verticals:

1. **LegalNations (HR/B2B SaaS)** — US company formation (LLC/Corp), KYC verification, IRS compliance tracking, document vault, compliance alerts, team task management.

2. **USDrop AI (Sales)** — Dropshipping automation, Shopify store management, product performance analytics, supplier management, winning products discovery, fulfillment tracking.

3. **FaireDesk** — Multi-brand wholesale marketplace management on Faire, order sync, retailer enrichment, vendor management, application tracking, revenue analytics.

4. **GoyoTours** — China B2B travel operations, tour packages, bookings, hotel and vendor management, event calendar, group tour analytics.

5. **Suprans** — Lead intake, identity enrichment, contact management, CRM pipeline.

6. **EventHub** — Networking events, venue management, attendee management, event packages, bookings.

7. **EazyToSell** — Retail franchise operations for China-to-India market, franchise leads, store management.

8. **Developer** — Internal tools, design system, component library, prompts library, technical resources.

**Data you can help with:**
- Client formation status and compliance
- Task management and escalations
- Team performance and assignments
- Financial transactions and ledger
- Channel messages and team communication
- Contact directories
- Product and order data
- Retailer and vendor information

**Your role:**
- Answer questions about business operations across all verticals
- Help summarize data, identify risks, and suggest next actions
- Guide users through workflows (e.g., onboarding a new client, syncing orders, checking compliance)
- Be concise, professional, and actionable
- When you don't have direct data access, describe what the user should look for in the platform

Always respond in a structured, helpful manner. Use markdown formatting for lists, headers, and code when appropriate.`;

async function getOrCreateConversation(
  conversationId: string | undefined,
  verticalId: string | undefined
): Promise<string> {
  if (conversationId) {
    const { data } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .single();
    if (data) return conversationId;
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ title: "New Chat", vertical_id: verticalId ?? null })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create conversation");
  return data.id;
}

async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  await supabase
    .from("ai_messages")
    .insert({ conversation_id: conversationId, role, content });
}

async function updateConversationTitle(conversationId: string, firstUserMessage: string) {
  const title = firstUserMessage.slice(0, 60) + (firstUserMessage.length > 60 ? "…" : "");
  await supabase
    .from("ai_conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("title", "New Chat");
}

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, conversationId: incomingId, verticalId } = req.body as {
      messages: { role: string; content: string }[];
      conversationId?: string;
      verticalId?: string;
    };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "messages required" });
    }

    const convId = await getOrCreateConversation(incomingId, verticalId);

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      await saveMessage(convId, "user", lastUserMessage.content);
      await updateConversationTitle(convId, lastUserMessage.content);
    }

    const aiMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const result = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT + (verticalId ? `\n\nCurrent vertical context: ${verticalId}` : ""),
      messages: aiMessages,
      maxTokens: 2048,
      onFinish: async ({ text }) => {
        await saveMessage(convId, "assistant", text);
        await supabase
          .from("ai_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      },
    });

    res.setHeader("X-Conversation-Id", convId);
    result.pipeDataStreamToResponse(res);
  } catch (err) {
    console.error("[ai-chat] chat error:", err);
    return res.status(500).json({ error: "AI chat failed" });
  }
});

router.get("/conversations", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title, vertical_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const { title = "New Chat", verticalId } = req.body as {
      title?: string;
      verticalId?: string;
    };
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ title, vertical_id: verticalId ?? null })
      .select("id, title, vertical_id, created_at, updated_at")
      .single();

    if (error || !data) return res.status(500).json({ error: "Failed to create conversation" });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export { router as aiChatRouter };
