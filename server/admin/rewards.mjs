import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase.from("courier_rewards").select("*, couriers(display_name)").order("created_at", { ascending: false }).limit(200);
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ rewards: data });
}

export async function POST(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.courier_id || payload?.amount === undefined) return json({ error: "Missing courier_id or amount" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase.from("courier_rewards").insert({
    courier_id: payload.courier_id,
    delivery_task_id: payload.delivery_task_id || null,
    amount: Number(payload.amount),
    reason: payload.reason || "Admin bonus",
    reward_type: payload.reward_type || "bonus"
  }).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ reward: data });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    return methodNotAllowed();
  }
};
