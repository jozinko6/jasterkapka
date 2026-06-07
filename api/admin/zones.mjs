import { methodNotAllowed } from "../../server/_lib/http.mjs";
import { GET, POST, PATCH } from "../../server/admin/zones.mjs";

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    if (request.method === "PATCH") return PATCH(request);
    return methodNotAllowed();
  }
};
