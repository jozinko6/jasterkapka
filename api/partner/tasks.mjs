import { json, methodNotAllowed, readJson } from "../_lib/http.mjs";
import { requirePartnerCourier } from "../_lib/partner-auth.mjs";

const orderStatusByDelivery = {
  picked_up: "out_for_delivery",
  near_customer: "out_for_delivery",
  delivered: "completed",
  failed: "out_for_delivery"
};

const messages = {
  accepted: "Partnerský kuriér prijal rozvoz.",
  arrived_at_restaurant: "Kuriér dorazil do prevádzky.",
  picked_up: "Kuriér prevzal objednávku.",
  near_customer: "Kuriér je blízko adresy.",
  delivered: "Objednávka bola doručená.",
  failed: "Kuriér označil problém s doručením."
};

export async function GET(request) {
  const auth = await requirePartnerCourier(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("delivery_tasks")
    .select("*, orders(total, payment_method, note, order_items(product_name, variant_name, extras, quantity))")
    .or(`status.eq.queued,courier_id.eq.${auth.courier.id}`)
    .in("status", ["queued", "assigned", "accepted", "arrived_at_restaurant", "picked_up", "near_customer"])
    .order("created_at", { ascending: true });
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ tasks: data, courier: auth.courier });
}

export async function PATCH(request) {
  const auth = await requirePartnerCourier(request);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  if (!payload?.id || !payload?.status) return json({ error: "Missing task id or status" }, { status: 400 });

  const { data: current, error: currentError } = await auth.supabase
    .from("delivery_tasks")
    .select("*")
    .eq("id", payload.id)
    .single();
  if (currentError || !current) return json({ error: "Task not found" }, { status: 404 });
  if (current.courier_id && current.courier_id !== auth.courier.id) return json({ error: "Task belongs to another courier" }, { status: 403 });

  const patch = {
    status: payload.status,
    courier_id: auth.courier.id,
    updated_at: new Date().toISOString()
  };
  if (payload.status === "accepted") patch.accepted_at = new Date().toISOString();
  if (payload.status === "picked_up") patch.picked_up_at = new Date().toISOString();
  if (payload.status === "delivered") patch.delivered_at = new Date().toISOString();

  const { data: task, error } = await auth.supabase.from("delivery_tasks").update(patch).eq("id", payload.id).select("*").single();
  if (error) return json({ error: error.message }, { status: 500 });

  const orderStatus = orderStatusByDelivery[payload.status];
  if (orderStatus) {
    await auth.supabase.from("orders").update({ status: orderStatus, updated_at: new Date().toISOString() }).eq("id", task.order_id);
    await auth.supabase.from("order_events").insert({
      order_id: task.order_id,
      status: orderStatus,
      message: messages[payload.status] || "Stav rozvozu bol zmenený."
    });
  }

  await auth.supabase.from("delivery_events").insert({
    delivery_task_id: task.id,
    order_id: task.order_id,
    status: payload.status,
    message: messages[payload.status] || "Stav rozvozu bol zmenený.",
    lat: payload.lat || null,
    lng: payload.lng || null
  });

  return json({ task });
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};
