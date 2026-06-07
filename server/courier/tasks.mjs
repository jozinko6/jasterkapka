import { json, methodNotAllowed, readJson, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";
import { awardLoyaltyPoints } from "../_lib/customer-profile.mjs";
import { validateCourierAssignment } from "../_lib/courier-routing.mjs";

const statusMessages = {
  assigned: "Kuriér bol priradený k objednávke.",
  accepted: "Kuriér prijal rozvoz.",
  arrived_at_restaurant: "Kuriér dorazil do prevádzky.",
  picked_up: "Kuriér prevzal objednávku.",
  near_customer: "Kuriér je blízko adresy.",
  delivered: "Objednávka bola doručená.",
  failed: "Rozvoz sa nepodarilo doručiť.",
  cancelled: "Rozvoz bol zrušený."
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

  const { data, error } = await supabase
    .from("delivery_tasks")
    .select("*, couriers(display_name, phone, vehicle_type, is_online), orders(total, payment_method, note, order_items(product_name, variant_name, extras, quantity))")
    .in("status", ["queued", "assigned", "accepted", "arrived_at_restaurant", "picked_up", "near_customer"])
    .order("created_at", { ascending: true });
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ tasks: data });
}

export async function PATCH(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.id || !payload?.status) return json({ error: "Missing id or status" }, { status: 400 });
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const { data: currentTask, error: currentTaskError } = await supabase.from("delivery_tasks").select("id, order_id, courier_id, status").eq("id", payload.id).single();
  if (currentTaskError) return json({ error: currentTaskError.message }, { status: 500 });

  if (payload.courier_id) {
    const validation = await validateCourierAssignment(supabase, { courierId: payload.courier_id, orderId: currentTask.order_id });
    if (!validation.ok) return json({ error: validation.error }, { status: validation.status || 409 });
  }

  const patch = { status: payload.status, updated_at: new Date().toISOString() };
  if (payload.courier_id) patch.courier_id = payload.courier_id;
  if (payload.status === "assigned") patch.assigned_at = new Date().toISOString();
  if (payload.status === "accepted") patch.accepted_at = new Date().toISOString();
  if (payload.status === "picked_up") patch.picked_up_at = new Date().toISOString();
  if (payload.status === "delivered") patch.delivered_at = new Date().toISOString();

  const { data: task, error } = await supabase.from("delivery_tasks").update(patch).eq("id", payload.id).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });

  let orderStatus = null;
  if (payload.status === "picked_up" || payload.status === "near_customer") orderStatus = "out_for_delivery";
  if (payload.status === "delivered") orderStatus = "completed";
  if (payload.status === "cancelled") orderStatus = "cancelled";

  if (orderStatus) {
    await supabase.from("orders").update({ status: orderStatus, updated_at: new Date().toISOString() }).eq("id", task.order_id);
    await supabase.from("order_events").insert({
      order_id: task.order_id,
      status: orderStatus,
      message: statusMessages[payload.status] || "Stav rozvozu bol zmenený."
    });
  }

  await supabase.from("delivery_events").insert({
    delivery_task_id: task.id,
    order_id: task.order_id,
    status: payload.status,
    message: payload.message || statusMessages[payload.status] || "Stav rozvozu bol zmenený.",
    lat: payload.lat || null,
    lng: payload.lng || null
  });

  if (payload.status === "delivered") {
    await awardLoyaltyPoints(supabase, task.order_id);
  }

  return json({ task });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};