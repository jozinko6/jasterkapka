import { json, methodNotAllowed, readJson } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

export async function POST(request) {
  const payload = await readJson(request);
  if (!payload?.subscription?.endpoint) return json({ error: "Missing push subscription" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("notification_subscriptions")
    .upsert({
      order_id: payload.orderId || null,
      endpoint: payload.subscription.endpoint,
      subscription: payload.subscription
    }, { onConflict: "endpoint" })
    .select("id")
    .single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ subscription: data });
}

export default { fetch: (request) => (request.method === "POST" ? POST(request) : methodNotAllowed()) };
