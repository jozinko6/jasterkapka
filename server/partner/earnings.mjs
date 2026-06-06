import { buildEarnings } from "../_lib/earnings.mjs";
import { json, methodNotAllowed } from "../_lib/http.mjs";
import { requirePartnerCourier } from "../_lib/partner-auth.mjs";

export async function GET(request) {
  const auth = await requirePartnerCourier(request);
  if (!auth.ok) return auth.response;

  const [{ data: deliveries, error: deliveriesError }, { data: rewards, error: rewardsError }] = await Promise.all([
    auth.supabase
      .from("delivery_tasks")
      .select("*, orders(total, payment_method, note)")
      .eq("courier_id", auth.courier.id)
      .order("created_at", { ascending: false })
      .limit(100),
    auth.supabase
      .from("courier_rewards")
      .select("*")
      .eq("courier_id", auth.courier.id)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  if (deliveriesError) return json({ error: deliveriesError.message }, { status: 500 });
  if (rewardsError) return json({ error: rewardsError.message }, { status: 500 });

  return json({
    courier: auth.courier,
    summary: buildEarnings(deliveries || [], rewards || []),
    deliveries: deliveries || [],
    rewards: rewards || []
  });
}

export default { fetch: (request) => (request.method === "GET" ? GET(request) : methodNotAllowed()) };
