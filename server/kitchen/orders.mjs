import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";
import { awardLoyaltyPoints } from "../_lib/customer-profile.mjs";
import { listCourierChoices, validateCourierAssignment } from "../_lib/courier-routing.mjs";

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

async function ensureDeliveryTasks(supabase) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, village, street, delivery_fee")
    .eq("status", "packing");
  if (error || !orders?.length) return;

  const { data: existing } = await supabase.from("delivery_tasks").select("order_id").in("order_id", orders.map((order) => order.id));
  const existingIds = new Set((existing || []).map((task) => task.order_id));
  const inserts = orders
    .filter((order) => !existingIds.has(order.id))
    .map((order) => ({
      order_id: order.id,
      dropoff_village: order.village,
      dropoff_street: order.street,
      fee: order.delivery_fee,
      status: "queued"
    }));
  if (inserts.length) await supabase.from("delivery_tasks").insert(inserts);
}

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  await ensureDeliveryTasks(supabase);

  const [ordersResult, couriersResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*), delivery_tasks(id, status, courier_id, couriers(display_name, vehicle_type, is_online))")
      .in("status", ["new", "accepted", "preparing", "baking", "packing", "out_for_delivery", "ready_for_pickup"])
      .order("created_at", { ascending: true }),
    listCourierChoices(supabase)
  ]);

  if (ordersResult.error) return json({ error: ordersResult.error.message }, { status: 500 });
  return json({ orders: ordersResult.data, couriers: couriersResult });
}

export async function PATCH(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.id || !payload?.status) return json({ error: "Missing id or status" }, { status: 400 });

  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  if (payload.courier_id) {
    const validation = await validateCourierAssignment(supabase, { courierId: payload.courier_id, orderId: payload.id });
    if (!validation.ok) return json({ error: validation.error }, { status: validation.status || 409 });
  }

  const nextStatus = payload.courier_id ? "out_for_delivery" : payload.status;
  const patch = { status: nextStatus, updated_at: new Date().toISOString() };
  if (nextStatus === "accepted") patch.accepted_at = new Date().toISOString();
  if (nextStatus === "completed") patch.completed_at = new Date().toISOString();

  const { data: order, error } = await supabase.from("orders").update(patch).eq("id", payload.id).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });

  const { data: existingTask } = await supabase.from("delivery_tasks").select("id, courier_id, status").eq("order_id", order.id).maybeSingle();
  if (payload.courier_id) {
    const taskPatch = {
      courier_id: payload.courier_id,
      status: "assigned",
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (existingTask?.id) {
      await supabase.from("delivery_tasks").update(taskPatch).eq("id", existingTask.id);
    } else {
      await supabase.from("delivery_tasks").insert({
        order_id: order.id,
        courier_id: payload.courier_id,
        status: "assigned",
        dropoff_village: order.village,
        dropoff_street: order.street,
        fee: order.delivery_fee,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  await supabase.from("order_events").insert({
    order_id: payload.id,
    status: nextStatus,
    message: payload.message || nextMessages[nextStatus] || "Stav objednávky bol zmenený."
  });

  if (nextStatus === "completed") {
    await awardLoyaltyPoints(supabase, order.id);
  }

  return json({ order });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};