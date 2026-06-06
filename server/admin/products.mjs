import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), product_variants(*)")
    .order("sort_order", { ascending: true });
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ products: data });
}

export async function POST(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.name || !payload?.category_id) return json({ error: "Missing name or category_id" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const record = {
    slug: payload.slug,
    category_id: payload.category_id,
    name: payload.name,
    description: payload.description || "",
    price: Number(payload.price || 0),
    icon: payload.icon || "+",
    is_popular: Boolean(payload.is_popular),
    is_active: payload.is_active !== false,
    sort_order: Number(payload.sort_order || 0)
  };
  const { data, error } = await supabase.from("products").upsert(record, { onConflict: "slug" }).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ product: data });
}

export async function PATCH(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.id) return json({ error: "Missing product id" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const { id, ...patch } = payload;
  patch.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from("products").update(patch).eq("id", id).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ product: data });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};
