import { json, methodNotAllowed } from "../../_lib/http.mjs";

export async function POST() {
  return json({ error: "OTP verification is disabled. Partner couriers are verified by active phone number." }, { status: 410 });
}

export default { fetch: (request) => (request.method === "POST" ? POST(request) : methodNotAllowed()) };
