import { methodNotAllowed } from "../../../server/_lib/http.mjs";
import { POST } from "../../../server/partner/auth/start.mjs";

export default {
  fetch(request) {
    return request.method === "POST" ? POST(request) : methodNotAllowed();
  }
};
