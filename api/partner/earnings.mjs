import { methodNotAllowed } from "../../server/_lib/http.mjs";
import { GET } from "../../server/partner/earnings.mjs";

export default {
  fetch(request) {
    return request.method === "GET" ? GET(request) : methodNotAllowed();
  }
};
