import { withGygAuth } from "@/lib/gyg/with-gyg-auth";
import { gygJson } from "@/lib/gyg/http";
import { getProductList } from "@/lib/gyg/service";

export const GET = withGygAuth(async (_req, _ctx) => {
  const list = getProductList();
  return gygJson({ data: list });
});
