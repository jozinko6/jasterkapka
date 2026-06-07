import { methodNotAllowed } from "../../server/_lib/http.mjs";
import * as adminInventory from "../../server/admin/inventory.mjs";
import * as adminOverview from "../../server/admin/overview.mjs";
import * as adminRewards from "../../server/admin/rewards.mjs";
import * as adminZones from "../../server/admin/zones.mjs";
import * as adminProducts from "../../server/admin/products.mjs";

const routes = [
  { pattern: /^overview$/, methods: { GET: adminOverview.GET } },
  { pattern: /^products$/, methods: { GET: adminProducts.GET, POST: adminProducts.POST, PATCH: adminProducts.PATCH } },
  { pattern: /^inventory$/, methods: { GET: adminInventory.GET, POST: adminInventory.POST } },
  { pattern: /^zones$/, methods: { GET: adminZones.GET, POST: adminZones.POST, PATCH: adminZones.PATCH } },
  { pattern: /^rewards$/, methods: { GET: adminRewards.GET, POST: adminRewards.POST } }
];

function route(request) {
  const path = new URL(request.url).pathname.replace(/^\/api\/admin\/?/, "").replace(/\/$/, "");
  const route = routes.find((entry) => entry.pattern.test(path));
  const fn = route?.methods[request.method];
  return fn ? fn(request) : methodNotAllowed();
}

export default { fetch: route };
