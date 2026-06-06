import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase.from("ingredients").select("*").order("name");
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ ingredients: data });
}

export async function POST(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.name) return json({ error: "Missing ingredient name" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase
    .from("ingredients")
    .upsert({
      name: payload.name,
      unit: payload.unit || "g",
      stock_qty: Number(payload.stock_qty || 0),
      low_stock_qty: Number(payload.low_stock_qty || 0),
      is_active: payload.is_active !== false,
      updated_at: new Date().toISOString()
    }, { onConflict: "name" })
    .select("*")
    .single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ ingredient: data });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    return methodNotAllowed();
  }
};
