import { methodNotAllowed } from "../../server/_lib/http.mjs";
import { GET } from "../../server/admin/overview.mjs";

export default {
  fetch(request) {
    return request.method === "GET" ? GET(request) : methodNotAllowed();
  }
};
