import { json, methodNotAllowed } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

export async function GET(request) {
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  const token = url.searchParams.get("token");
  if (!id || !token) return json({ error: "Missing order id or token" }, { status: 400 });

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, public_token, status, village, street, subtotal, delivery_fee, total, created_at, promised_at, order_events(status, message, created_at), order_items(product_name, variant_name, extras, quantity, line_total)")
    .eq("id", id)
    .eq("public_token", token)
    .single();

  if (error) return json({ error: "Order not found" }, { status: 404 });
  return json({ order });
}

export default { fetch: (request) => (request.method === "GET" ? GET(request) : methodNotAllowed()) };
