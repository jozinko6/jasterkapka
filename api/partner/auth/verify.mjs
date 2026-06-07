import { methodNotAllowed } from "../../../server/_lib/http.mjs";
import { POST } from "../../../server/partner/auth/verify.mjs";

export default {
  fetch(request) {
    return request.method === "POST" ? POST(request) : methodNotAllowed();
  }
};
