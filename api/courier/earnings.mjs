import { methodNotAllowed } from "../../server/_lib/http.mjs";
import { GET } from "../../server/courier/earnings.mjs";

export default {
  fetch(request) {
    return request.method === "GET" ? GET(request) : methodNotAllowed();
  }
};
