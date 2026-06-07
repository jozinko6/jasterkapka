import { json, methodNotAllowed, readJson } from "./_lib/http.mjs";
import { adminClient } from "./_lib/supabase.mjs";
import { lookupCustomerProfile, upsertCustomerProfile } from "./_lib/customer-profile.mjs";

export async function GET(request) {
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const url = new URL(request.url);
  const customer = await lookupCustomerProfile(supabase, {
    phone: url.searchParams.get("phone"),
    email: url.searchParams.get("email")
  });

  return json({ customer });
}

export async function POST(request) {
  const payload = await readJson(request);
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  try {
    const customer = await upsertCustomerProfile(supabase, payload || {});
    return json({ customer });
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
}

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    return methodNotAllowed();
  }
};