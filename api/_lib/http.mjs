export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": init.cacheControl || "no-store",
      ...(init.headers || {})
    }
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function badRequest(message, details) {
  return json({ error: message, details }, { status: 400 });
}

export function methodNotAllowed() {
  return json({ error: "Method not allowed" }, { status: 405 });
}

export function requireStaff(request) {
  const configuredPin = process.env.STAFF_PIN;
  if (!configuredPin) return { ok: false, response: json({ error: "STAFF_PIN is not configured" }, { status: 500 }) };
  const pin = request.headers.get("x-staff-pin");
  if (pin !== configuredPin) return { ok: false, response: json({ error: "Unauthorized" }, { status: 401 }) };
  return { ok: true };
}
