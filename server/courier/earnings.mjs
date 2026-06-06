import { buildEarnings } from "../_lib/earnings.mjs";
import { json, methodNotAllowed, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const url = new URL(request.url);
  const courierId = url.searchParams.get("courierId");
  const [{ data: couriers, error: couriersError }, { data: deliveries, error: deliveriesError }, { data: rewards, error: rewardsError }] = await Promise.all([
    supabase.from("couriers").select("*").eq("is_active", true).order("display_name"),
    courierId
      ? supabase.from("delivery_tasks").select("*, orders(total, payment_method, note)").eq("courier_id", courierId).order("created_at", { ascending: false }).limit(200)
      : supabase.from("delivery_tasks").select("*, orders(total, payment_method, note)").order("created_at", { ascending: false }).limit(300),
    courierId
      ? supabase.from("courier_rewards").select("*").eq("courier_id", courierId).order("created_at", { ascending: false }).limit(200)
      : supabase.from("courier_rewards").select("*").order("created_at", { ascending: false }).limit(300)
  ]);

  if (couriersError) return json({ error: couriersError.message }, { status: 500 });
  if (deliveriesError) return json({ error: deliveriesError.message }, { status: 500 });
  if (rewardsError) return json({ error: rewardsError.message }, { status: 500 });

  const grouped = (couriers || []).map((courier) => {
    const courierDeliveries = (deliveries || []).filter((task) => task.courier_id === courier.id);
    const courierRewards = (rewards || []).filter((reward) => reward.courier_id === courier.id);
    return {
      courier,
      summary: buildEarnings(courierDeliveries, courierRewards),
      deliveries: courierDeliveries,
      rewards: courierRewards
    };
  });

  return json({ couriers: grouped });
}

export default { fetch: (request) => (request.method === "GET" ? GET(request) : methodNotAllowed()) };
