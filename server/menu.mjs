import { deliveryLocations } from "./_lib/catalog.mjs";
import { json } from "./_lib/http.mjs";
import { adminClient } from "./_lib/supabase.mjs";

export async function GET() {
  const supabase = adminClient();
  if (!supabase) {
    return json({ products: [], deliveryLocations, configured: false });
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, name, description, price, icon, is_popular, sort_order, categories(name), product_variants(id, name, price_delta, sort_order)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return json({ error: error.message }, { status: 500 });

  const ids = products.map((product) => product.id);
  const { data: links, error: linksError } = ids.length
    ? await supabase
        .from("product_extras")
        .select("product_id, products!product_extras_extra_product_id_fkey(name, price)")
        .in("product_id", ids)
    : { data: [], error: null };

  if (linksError) return json({ error: linksError.message }, { status: 500 });

  const extrasByProduct = new Map();
  for (const link of links || []) {
    const list = extrasByProduct.get(link.product_id) || [];
    if (link.products) list.push({ name: link.products.name, price: Number(link.products.price) });
    extrasByProduct.set(link.product_id, list);
  }

  const mapped = products.map((product) => ({
    id: product.slug,
    dbId: product.id,
    category: product.categories?.name || "Menu",
    name: product.name,
    description: product.description,
    price: Number(product.price),
    icon: product.icon,
    popular: product.is_popular,
    variants: (product.product_variants || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({ id: variant.id, name: variant.name, price: Number(variant.price_delta) })),
    extras: extrasByProduct.get(product.id) || []
  }));

  return json({ products: mapped, deliveryLocations, configured: true });
}

export default { fetch: (request) => (request.method === "GET" ? GET(request) : json({ error: "Method not allowed" }, { status: 405 })) };
