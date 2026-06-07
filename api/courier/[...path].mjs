import { methodNotAllowed } from "../../server/_lib/http.mjs";
import * as courierCouriers from "../../server/courier/couriers.mjs";
import * as courierEarnings from "../../server/courier/earnings.mjs";
import * as courierTasks from "../../server/courier/tasks.mjs";

const routes = [
  { pattern: /^couriers$/, methods: { GET: courierCouriers.GET, POST: courierCouriers.POST, PATCH: courierCouriers.PATCH } },
  { pattern: /^tasks$/, methods: { GET: courierTasks.GET, PATCH: courierTasks.PATCH } },
  { pattern: /^earnings$/, methods: { GET: courierEarnings.GET } }
];

function route(request) {
  const path = new URL(request.url).pathname.replace(/^\/api\/courier\/?/, "").replace(/\/$/, "");
  const route = routes.find((entry) => entry.pattern.test(path));
  const fn = route?.methods[request.method];
  return fn ? fn(request) : methodNotAllowed();
}

export default { fetch: route };
