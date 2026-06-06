import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

const nextMessages = {
  accepted: "Objednávka bola prijatá kuchyňou.",
  preparing: "Objednávka sa pripravuje.",
  baking: "Pizza je v peci.",
  packing: "Objednávka sa balí.",
  out_for_delivery: "Objednávka je na ceste.",
  ready_for_pickup: "Objednávka je pripravená.",
  completed: "Objednávka bola dokončená.",
  cancelled: "Objednávka bola zrušená."
};

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .in("status", ["new", "accepted", "preparing", "baking", "packing", "out_for_delivery", "ready_for_pickup"])
    .order("created_at", { ascending: true });
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ orders: data });
}

export async function PATCH(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.id || !payload?.status) return json({ error: "Missing id or status" }, { status: 400 });

  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const patch = { status: payload.status, updated_at: new Date().toISOString() };
  if (payload.status === "accepted") patch.accepted_at = new Date().toISOString();
  if (payload.status === "completed") patch.completed_at = new Date().toISOString();

  const { data, error } = await supabase.from("orders").update(patch).eq("id", payload.id).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });

  await supabase.from("order_events").insert({
    order_id: payload.id,
    status: payload.status,
    message: payload.message || nextMessages[payload.status] || "Stav objednávky bol zmenený."
  });

  return json({ order: data });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};
