const activeDeliveryStatuses = ["queued", "assigned", "accepted", "arrived_at_restaurant", "picked_up", "near_customer"];

function countActiveTasks(tasks, courierId) {
  return tasks.filter((task) => task.courier_id === courierId).length;
}

export async function listCourierChoices(supabase) {
  const [{ data: couriers, error: couriersError }, { data: tasks, error: tasksError }] = await Promise.all([
    supabase.from("couriers").select("id, display_name, phone, vehicle_type, is_active, is_online, last_seen_at").eq("is_active", true).order("display_name"),
    supabase.from("delivery_tasks").select("courier_id, order_id, status").in("status", activeDeliveryStatuses)
  ]);
  if (couriersError) throw new Error(couriersError.message);
  if (tasksError) throw new Error(tasksError.message);

  return (couriers || []).map((courier) => {
    const activeCount = countActiveTasks(tasks || [], courier.id);
    const isAvailable = courier.is_active && courier.is_online && activeCount === 0;
    const availabilityReason = !courier.is_active
      ? "Neaktívny"
      : !courier.is_online
        ? "Offline"
        : activeCount > 0
          ? "Na rozvoze"
          : "Dostupný";
    return {
      ...courier,
      active_delivery_count: activeCount,
      is_available: isAvailable,
      availability_reason: availabilityReason
    };
  });
}

export async function validateCourierAssignment(supabase, { courierId, orderId }) {
  const [{ data: courier, error: courierError }, { data: order, error: orderError }, { data: tasks, error: tasksError }] = await Promise.all([
    supabase.from("couriers").select("id, display_name, vehicle_type, is_active, is_online").eq("id", courierId).single(),
    supabase.from("orders").select("id, total, village, street, status, order_items(quantity)").eq("id", orderId).single(),
    supabase.from("delivery_tasks").select("id, order_id, courier_id, status").in("status", activeDeliveryStatuses).eq("courier_id", courierId)
  ]);

  if (courierError || !courier) return { ok: false, status: 404, error: "Kuriér neexistuje." };
  if (orderError || !order) return { ok: false, status: 404, error: "Objednávka neexistuje." };
  if (!courier.is_active) return { ok: false, status: 409, error: "Kuriér nie je aktívny." };
  if (!courier.is_online) return { ok: false, status: 409, error: "Kuriér je offline." };

  const activeOtherTask = (tasks || []).find((task) => task.order_id !== orderId);
  if (activeOtherTask) return { ok: false, status: 409, error: "Kuriér práve doručuje inú objednávku." };

  const itemCount = (order.order_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const requiresCar = Number(order.total || 0) >= 25 || itemCount >= 4;
  if (requiresCar && courier.vehicle_type !== "car") {
    return { ok: false, status: 409, error: "Tento rozvoz vyžaduje auto." };
  }

  return { ok: true, courier, order, itemCount, requiresCar };
}