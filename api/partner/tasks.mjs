import { methodNotAllowed } from "../../server/_lib/http.mjs";
import { GET, PATCH } from "../../server/partner/tasks.mjs";

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};
