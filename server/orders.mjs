import { deliveryForVillage, money, validateStreet } from "./_lib/catalog.mjs";
import { badRequest, json, methodNotAllowed, readJson } from "./_lib/http.mjs";
import { adminClient } from "./_lib/supabase.mjs";

async function loadProducts(supabase, items) {
  const slugs = [...new Set(items.map((item) => item.productId).filter(Boolean))];
  const extraNames = [...new Set(items.flatMap((item) => (Array.isArray(item.extras) ? item.extras : [])).filter(Boolean))];
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, price, is_active, product_variants(id, name, price_delta)")
    .in("slug", slugs);
  if (error) throw new Error(error.message);
  const { data: extras, error: extrasError } = extraNames.length
    ? await supabase.from("products").select("id, name, price, is_active").in("name", extraNames)
    : { data: [], error: null };
  if (extrasError) throw new Error(extrasError.message);
  return {
    products: new Map(data.map((product) => [product.slug, product])),
    extras: new Map((extras || []).filter((extra) => extra.is_active).map((extra) => [extra.name, extra]))
  };
}

export async function POST(request) {
  const payload = await readJson(request);
  if (!payload || !Array.isArray(payload.items) || !payload.items.length) return badRequest("Cart is empty");

  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const location = deliveryForVillage(payload.delivery?.village);
  if (!location) return badRequest("Unsupported delivery village");

  const street = validateStreet(payload.delivery?.street);
  if (!street) return badRequest("Street must include street name and house number");

  const catalog = await loadProducts(supabase, payload.items);
  const orderItems = [];
  let subtotal = 0;

  for (const item of payload.items) {
    const product = catalog.products.get(item.productId);
    if (!product || !product.is_active) return badRequest(`Product is not available: ${item.productId}`);
    const quantity = Math.max(1, Math.min(20, Number(item.qty || 1)));
    const variant = product.product_variants?.find((entry) => entry.name === item.variant) || product.product_variants?.[0];
    const requestedExtras = Array.isArray(item.extras) ? item.extras.slice(0, 20).map(String) : [];
    const extrasTotal = requestedExtras.reduce((sum, extraName) => {
      const extra = catalog.extras.get(extraName);
      return money(sum + Number(extra?.price || 0));
    }, 0);
    const unitPrice = money(Number(product.price) + Number(variant?.price_delta || 0) + extrasTotal);
    const lineTotal = money(unitPrice * quantity);
    subtotal = money(subtotal + lineTotal);
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      variant_name: variant?.name || null,
      extras: requestedExtras.filter((extraName) => catalog.extras.has(extraName)),
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal
    });
  }

  if (subtotal < location.minimum) {
    return badRequest(`Minimum order for ${location.village} is ${location.minimum} EUR`, {
      minimum: location.minimum,
      subtotal
    });
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({ phone: payload.customer?.phone || null, name: payload.customer?.name || null })
    .select("id")
    .single();
  if (customerError) return json({ error: customerError.message }, { status: 500 });

  const orderRecord = {
    customer_id: customer.id,
    village: location.village,
    street,
    note: payload.note || null,
    payment_method: payload.paymentMethod === "card" ? "card" : "cash",
    subtotal,
    delivery_fee: location.fee,
    total: money(subtotal + location.fee)
  };

  const { data: order, error: orderError } = await supabase.from("orders").insert(orderRecord).select("*").single();
  if (orderError) return json({ error: orderError.message }, { status: 500 });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
  if (itemsError) return json({ error: itemsError.message }, { status: 500 });

  await supabase.from("order_events").insert({
    order_id: order.id,
    status: "new",
    message: "Objednávka bola prijatá do systému."
  });

  return json({
    order: {
      id: order.id,
      token: order.public_token,
      status: order.status,
      total: Number(order.total),
      deliveryFee: Number(order.delivery_fee)
    }
  }, { status: 201 });
}

export default { fetch: (request) => (request.method === "POST" ? POST(request) : methodNotAllowed()) };
