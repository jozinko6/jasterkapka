import { json } from "./http.mjs";
import { adminClient } from "./supabase.mjs";

export async function requirePartnerCourier(request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, response: json({ error: "Missing bearer token" }, { status: 401 }) };

  const supabase = adminClient();
  if (!supabase) return { ok: false, response: json({ error: "Supabase is not configured" }, { status: 503 }) };

  if (token.startsWith("phone:")) {
    const phone = decodeURIComponent(token.slice("phone:".length));
    if (!/^\+\d{8,15}$/.test(phone)) return { ok: false, response: json({ error: "Invalid phone token" }, { status: 401 }) };
    const { data: courier, error } = await supabase.from("couriers").select("*").eq("is_active", true).eq("phone", phone).maybeSingle();
    if (error) return { ok: false, response: json({ error: error.message }, { status: 500 }) };
    if (!courier) return { ok: false, response: json({ error: "Courier is not approved yet" }, { status: 403 }) };
    await supabase.from("couriers").update({ is_online: true, last_seen_at: new Date().toISOString() }).eq("id", courier.id);
    return { ok: true, supabase, user: { id: courier.staff_user_id, phone }, courier: { ...courier, is_online: true } };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) return { ok: false, response: json({ error: "Invalid session" }, { status: 401 }) };

  const user = userData.user;
  const phone = user.phone || user.user_metadata?.phone;
  let { data: courier, error } = await supabase.from("couriers").select("*").eq("is_active", true).eq("staff_user_id", user.id).maybeSingle();
  if (error) return { ok: false, response: json({ error: error.message }, { status: 500 }) };
  if (!courier && phone) {
    const byPhone = await supabase.from("couriers").select("*").eq("is_active", true).eq("phone", phone).maybeSingle();
    if (byPhone.error) return { ok: false, response: json({ error: byPhone.error.message }, { status: 500 }) };
    courier = byPhone.data;
  }
  if (!courier) return { ok: false, response: json({ error: "Courier profile is not approved yet" }, { status: 403 }) };

  await supabase
    .from("couriers")
    .update({ staff_user_id: user.id, is_online: true, last_seen_at: new Date().toISOString() })
    .eq("id", courier.id);

  return { ok: true, supabase, user, courier: { ...courier, staff_user_id: user.id, is_online: true } };
}
