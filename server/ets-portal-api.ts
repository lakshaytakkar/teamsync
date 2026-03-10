import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const etsSupabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
      db: { schema: "easytosell" },
    })
  : null as any;

export const etsPortalRouter = Router();

function mapClient(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    phone: row.phone,
    stage: row.stage,
    storeSize: row.store_size,
    packageTier: row.package_tier,
    daysInStage: row.days_in_stage,
    lastNote: row.last_note,
    totalPaid: parseFloat(row.total_paid) || 0,
    pendingDues: parseFloat(row.pending_dues) || 0,
    score: row.score,
    leadSource: row.lead_source,
    assignedTo: row.assigned_to,
    nextAction: row.next_action,
    nextActionDate: row.next_action_date,
    createdDate: row.created_at ? row.created_at.split("T")[0] : "",
  };
}

function mapOrder(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    status: row.status,
    etaDays: row.eta_days,
    valueInr: parseFloat(row.value_inr) || 0,
    itemCount: row.item_count,
    createdDate: row.created_at ? row.created_at.split("T")[0] : "",
    documents: row.documents || [],
    isFlagged: row.is_flagged,
  };
}

function mapPayment(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    amount: parseFloat(row.amount) || 0,
    type: row.type,
    status: row.status,
    date: row.date,
    notes: row.notes,
  };
}

function mapChecklist(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    itemId: row.item_id,
    clientId: row.client_id,
    completed: row.completed,
    label: row.ets_checklist_items?.label || "",
    sortOrder: row.ets_checklist_items?.sort_order || 0,
  };
}

function mapMessage(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    sender: row.sender,
    senderName: row.sender_name,
    content: row.content,
    read: row.read,
    createdAt: row.created_at,
  };
}

etsPortalRouter.get("/client/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_clients")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return res.status(404).json({ error: "Client not found" });
    res.json({ client: mapClient(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/orders", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_orders")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ orders: (data || []).map(mapOrder) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/payments", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_payments")
      .select("*")
      .eq("client_id", id)
      .order("date", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ payments: (data || []).map(mapPayment) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/checklist", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_checklist_status")
      .select("*, ets_checklist_items(label, sort_order)")
      .eq("client_id", id)
      .order("item_id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ checklist: (data || []).map(mapChecklist) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.patch("/client/:clientId/checklist/:statusId", async (req, res) => {
  try {
    const { statusId } = req.params;
    const { completed } = req.body;
    const { data, error } = await etsSupabase
      .from("ets_checklist_status")
      .update({ completed })
      .eq("id", statusId)
      .select("*, ets_checklist_items(label, sort_order)")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ item: mapChecklist(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("client_messages")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ messages: (data || []).map(mapMessage) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.post("/client/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, senderName } = req.body;
    const { data, error } = await etsSupabase
      .from("client_messages")
      .insert({
        client_id: parseInt(id),
        sender: "client",
        sender_name: senderName || "Client",
        content,
        read: false,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: mapMessage(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.post("/client/:id/messages/mark-read", async (req, res) => {
  try {
    const { id } = req.params;
    await etsSupabase
      .from("client_messages")
      .update({ read: true })
      .eq("client_id", id)
      .eq("sender", "team")
      .eq("read", false);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/proposal", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: client } = await etsSupabase
      .from("ets_clients")
      .select("package_tier")
      .eq("id", id)
      .single();
    if (!client) return res.status(404).json({ error: "Client not found" });

    const { data: template } = await etsSupabase
      .from("ets_proposal_templates")
      .select("*")
      .eq("package_tier", client.package_tier)
      .single();
    res.json({ template: template || null });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
