import { json, methodNotAllowed, readJson } from "../../_lib/http.mjs";
import { adminClient } from "../../_lib/supabase.mjs";

export async function POST(request) {
  const payload = await readJson(request);
  const phone = String(payload?.phone || "").trim();
  if (!/^\+\d{8,15}$/.test(phone)) return json({ error: "Telefón musí byť v medzinárodnom formáte, napr. +421..." }, { status: 400 });

  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const { data: courier, error } = await supabase.from("couriers").select("*").eq("is_active", true).eq("phone", phone).maybeSingle();
  if (error) return json({ error: error.message }, { status: 500 });
  if (!courier) return json({ error: "Kuriér s týmto číslom ešte nie je aktivovaný kuchyňou." }, { status: 403 });

  await supabase.from("couriers").update({ is_online: true, last_seen_at: new Date().toISOString() }).eq("id", courier.id);

  return json({
    session: {
      access_token: `phone:${encodeURIComponent(phone)}`,
      token_type: "phone",
      expires_in: 0
    },
    courier: { ...courier, is_online: true }
  });
}

export default { fetch: (request) => (request.method === "POST" ? POST(request) : methodNotAllowed()) };
