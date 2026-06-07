import { methodNotAllowed } from "../../server/_lib/http.mjs";
import * as partnerAuthStart from "../../server/partner/auth/start.mjs";
import * as partnerAuthVerify from "../../server/partner/auth/verify.mjs";
import * as partnerEarnings from "../../server/partner/earnings.mjs";
import * as partnerMe from "../../server/partner/me.mjs";
import * as partnerTasks from "../../server/partner/tasks.mjs";

const routes = [
  { pattern: /^auth\/start$/, methods: { POST: partnerAuthStart.POST } },
  { pattern: /^auth\/verify$/, methods: { POST: partnerAuthVerify.POST } },
  { pattern: /^me$/, methods: { GET: partnerMe.GET } },
  { pattern: /^tasks$/, methods: { GET: partnerTasks.GET, PATCH: partnerTasks.PATCH } },
  { pattern: /^earnings$/, methods: { GET: partnerEarnings.GET } }
];

function route(request) {
  const path = new URL(request.url).pathname.replace(/^\/api\/partner\/?/, "").replace(/\/$/, "");
  const route = routes.find((entry) => entry.pattern.test(path));
  const fn = route?.methods[request.method];
  return fn ? fn(request) : methodNotAllowed();
}

export default { fetch: route };
