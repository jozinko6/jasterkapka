export function normalizeName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  return name.length >= 2 ? name : null;
}

export function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    const normalized = `+${digits.slice(1).replace(/\D/g, "")}`;
    return normalized.length >= 9 ? normalized : null;
  }
  const cleaned = digits.replace(/\D/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("0")) {
    const normalized = `+421${cleaned.slice(1)}`;
    return normalized.length >= 9 ? normalized : null;
  }
  const normalized = `+${cleaned}`;
  return normalized.length >= 9 ? normalized : null;
}

export function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function loyaltyPointsForTotal(total) {
  return Math.max(1, Math.floor(Number(total || 0)));
}

async function lookupByPhoneOrEmail(supabase, phone, email) {
  if (phone) {
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, email, newsletter_opt_in, loyalty_points, registered_at, last_order_at, created_at")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data;
  }

  if (email) {
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, email, newsletter_opt_in, loyalty_points, registered_at, last_order_at, created_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data;
  }

  return null;
}

export async function upsertCustomerProfile(supabase, payload = {}) {
  const name = normalizeName(payload.name);
  const phone = normalizePhone(payload.phone);
  const email = normalizeEmail(payload.email);

  if (!name) throw new Error("Meno je povinné.");
  if (!phone) throw new Error("Telefónne číslo je povinné.");
  if (payload.newsletterOptIn && !email) throw new Error("Pre newsletter je potrebný email.");

  const existing = await lookupByPhoneOrEmail(supabase, phone, email);
  const now = new Date().toISOString();
  const shouldRegister = payload.registerAccount !== false || Boolean(email) || Boolean(payload.newsletterOptIn);
  const newsletterOptIn = Boolean(payload.newsletterOptIn && email);

  const patch = {
    name,
    phone,
    email: email || existing?.email || null,
    newsletter_opt_in: newsletterOptIn || Boolean(existing?.newsletter_opt_in),
    registered_at: existing?.registered_at || (shouldRegister ? now : null),
    last_order_at: existing?.last_order_at || null
  };

  if (existing) {
    const { data, error } = await supabase
      .from("customers")
      .update(patch)
      .eq("id", existing.id)
      .select("id, name, phone, email, newsletter_opt_in, loyalty_points, registered_at, last_order_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      ...patch,
      loyalty_points: 0
    })
    .select("id, name, phone, email, newsletter_opt_in, loyalty_points, registered_at, last_order_at, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function lookupCustomerProfile(supabase, payload = {}) {
  const phone = normalizePhone(payload.phone);
  const email = normalizeEmail(payload.email);
  return lookupByPhoneOrEmail(supabase, phone, email);
}

export async function awardLoyaltyPoints(supabase, orderId) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total, customer_id, loyalty_awarded_at")
    .eq("id", orderId)
    .single();
  if (orderError || !order?.customer_id || order.loyalty_awarded_at) return null;

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, loyalty_points, registered_at")
    .eq("id", order.customer_id)
    .single();
  if (customerError || !customer?.registered_at) return null;

  const points = loyaltyPointsForTotal(order.total);
  const now = new Date().toISOString();

  await supabase.from("orders").update({ loyalty_awarded_at: now }).eq("id", orderId).is("loyalty_awarded_at", null);
  await supabase
    .from("customers")
    .update({ loyalty_points: Number(customer.loyalty_points || 0) + points, last_order_at: now })
    .eq("id", customer.id);

  return points;
}