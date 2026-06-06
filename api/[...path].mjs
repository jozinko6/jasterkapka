import { methodNotAllowed } from "../server/_lib/http.mjs";
import * as adminInventory from "../server/admin/inventory.mjs";
import * as adminProducts from "../server/admin/products.mjs";
import * as courierCouriers from "../server/courier/couriers.mjs";
import * as courierEarnings from "../server/courier/earnings.mjs";
import * as courierTasks from "../server/courier/tasks.mjs";
import * as kitchenOrders from "../server/kitchen/orders.mjs";
import * as menu from "../server/menu.mjs";
import * as notificationsSubscribe from "../server/notifications/subscribe.mjs";
import * as orderDetail from "../server/orders/[id].mjs";
import * as orders from "../server/orders.mjs";
import * as partnerAuthStart from "../server/partner/auth/start.mjs";
import * as partnerAuthVerify from "../server/partner/auth/verify.mjs";
import * as partnerEarnings from "../server/partner/earnings.mjs";
import * as partnerMe from "../server/partner/me.mjs";
import * as partnerTasks from "../server/partner/tasks.mjs";

const routes = [
  { pattern: /^menu$/, methods: { GET: menu.GET } },
  { pattern: /^orders$/, methods: { POST: orders.POST } },
  { pattern: /^orders\/[^/]+$/, methods: { GET: orderDetail.GET } },
  { pattern: /^kitchen\/orders$/, methods: { GET: kitchenOrders.GET, PATCH: kitchenOrders.PATCH } },
  { pattern: /^admin\/products$/, methods: { GET: adminProducts.GET, POST: adminProducts.POST, PATCH: adminProducts.PATCH } },
  { pattern: /^admin\/inventory$/, methods: { GET: adminInventory.GET, POST: adminInventory.POST } },
  { pattern: /^courier\/couriers$/, methods: { GET: courierCouriers.GET, POST: courierCouriers.POST, PATCH: courierCouriers.PATCH } },
  { pattern: /^courier\/tasks$/, methods: { GET: courierTasks.GET, PATCH: courierTasks.PATCH } },
  { pattern: /^courier\/earnings$/, methods: { GET: courierEarnings.GET } },
  { pattern: /^partner\/auth\/start$/, methods: { POST: partnerAuthStart.POST } },
  { pattern: /^partner\/auth\/verify$/, methods: { POST: partnerAuthVerify.POST } },
  { pattern: /^partner\/me$/, methods: { GET: partnerMe.GET } },
  { pattern: /^partner\/tasks$/, methods: { GET: partnerTasks.GET, PATCH: partnerTasks.PATCH } },
  { pattern: /^partner\/earnings$/, methods: { GET: partnerEarnings.GET } },
  { pattern: /^notifications\/subscribe$/, methods: { POST: notificationsSubscribe.POST } }
];

async function route(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const route = routes.find((entry) => entry.pattern.test(path));
  const fn = route?.methods[request.method];
  return fn ? fn(request) : methodNotAllowed();
}

async function toWebRequest(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  return new Request(`https://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body
  });
}

export default async function handler(req, res) {
  const response = await route(await toWebRequest(req));
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
