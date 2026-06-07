import { methodNotAllowed } from "../../server/_lib/http.mjs";
import { GET, POST } from "../../server/admin/rewards.mjs";

export default {
  fetch(request) {
    if (request.method === "GET") return GET(request);
    if (request.method === "POST") return POST(request);
    return methodNotAllowed();
  }
};
