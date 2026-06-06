import { json, methodNotAllowed } from "../_lib/http.mjs";
import { requirePartnerCourier } from "../_lib/partner-auth.mjs";

export async function GET(request) {
  const auth = await requirePartnerCourier(request);
  if (!auth.ok) return auth.response;
  return json({ courier: auth.courier, user: { id: auth.user.id, phone: auth.user.phone } });
}

export default { fetch: (request) => (request.method === "GET" ? GET(request) : methodNotAllowed()) };
