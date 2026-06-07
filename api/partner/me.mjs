import { methodNotAllowed } from "../../server/_lib/http.mjs";
import { GET } from "../../server/partner/me.mjs";

export default {
  fetch(request) {
    return request.method === "GET" ? GET(request) : methodNotAllowed();
  }
};
