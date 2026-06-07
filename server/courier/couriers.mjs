import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";
import { listCourierChoices } from "../_lib/courier-routing.mjs";

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const couriers = await listCourierChoices(supabase);
  return json({ couriers });
}

export async function POST(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.display_name) return json({ error: "Missing courier name" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase
    .from("couriers")
    .insert({
      display_name: payload.display_name,
      phone: payload.phone || null,
      vehicle_type: payload.vehicle_type || "car",
      is_active: payload.is_active !== false,
      is_online: Boolean(payload.is_online)
    })
    .select("*")
    .single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ courier: data });
}

export async function PATCH(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.id) return json({ error: "Missing courier id" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { id, ...patch } = payload;
  patch.last_seen_at = new Date().toISOString();
  const { data, error } = await supabase.from("couriers").update(patch).eq("id", id).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ courier: data });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};