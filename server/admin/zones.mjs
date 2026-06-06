import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase.from("delivery_zones").select("*").order("sort_order", { ascending: true });
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ zones: data });
}

export async function POST(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.village) return json({ error: "Missing village" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase
    .from("delivery_zones")
    .upsert({
      village: payload.village,
      fee: Number(payload.fee || 0),
      minimum_order: Number(payload.minimum_order || 0),
      is_active: payload.is_active !== false,
      sort_order: Number(payload.sort_order || 0)
    }, { onConflict: "village" })
    .select("*")
    .single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ zone: data });
}

export async function PATCH(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.id) return json({ error: "Missing zone id" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { id, ...patch } = payload;
  const { data, error } = await supabase.from("delivery_zones").update(patch).eq("id", id).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ zone: data });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};
