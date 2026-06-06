import { json, methodNotAllowed, requireStaff } from "../_lib/http.mjs";
import { adminClient } from "../_lib/supabase.mjs";

function money(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export async function GET(request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;
  const supabase = adminClient();
  if (!supabase) return json({ error: "Supabase is not configured" }, { status: 503 });

  const [categoriesRes, ordersRes, tasksRes, couriersRes, productsRes, ingredientsRes, zonesRes, rewardsRes] = await Promise.all([
    supabase.from("categories").select("id,name,sort_order,is_active").order("sort_order", { ascending: true }),
    supabase.from("orders").select("id,status,total,delivery_fee,subtotal,village,street,payment_method,created_at,updated_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("delivery_tasks").select("id,status,fee,dropoff_village,dropoff_street,courier_id,order_id,delivered_at,created_at,updated_at,orders(total,payment_method,note)").order("created_at", { ascending: false }).limit(100),
    supabase.from("couriers").select("id,display_name,phone,vehicle_type,is_active,is_online,last_seen_at").order("display_name"),
    supabase.from("products").select("id,slug,name,price,is_active,is_popular,sort_order,categories(name)").order("sort_order", { ascending: true }),
    supabase.from("ingredients").select("id,name,unit,stock_qty,low_stock_qty,is_active,updated_at").order("name"),
    supabase.from("delivery_zones").select("id,village,fee,minimum_order,is_active,sort_order").order("sort_order", { ascending: true }),
    supabase.from("courier_rewards").select("id,courier_id,amount,reason,reward_type,created_at").order("created_at", { ascending: false }).limit(100)
  ]);

  const results = [categoriesRes, ordersRes, tasksRes, couriersRes, productsRes, ingredientsRes, zonesRes, rewardsRes];
  const firstError = results.find((result) => result.error);
  if (firstError?.error) return json({ error: firstError.error.message }, { status: 500 });

  const categories = categoriesRes.data || [];
  const orders = ordersRes.data || [];
  const tasks = tasksRes.data || [];
  const couriers = couriersRes.data || [];
  const products = productsRes.data || [];
  const ingredients = ingredientsRes.data || [];
  const zones = zonesRes.data || [];
  const rewards = rewardsRes.data || [];

  const activeOrders = orders.filter((order) => !["completed", "cancelled"].includes(order.status));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => new Date(order.created_at) >= today);
  const deliveredTasks = tasks.filter((task) => task.status === "delivered");
  const activeCouriers = couriers.filter((courier) => courier.is_online);
  const lowStock = ingredients.filter((ingredient) => Number(ingredient.stock_qty) <= Number(ingredient.low_stock_qty || 0));
  const revenue = money(orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total || 0), 0));
  const deliveryEarnings = money(deliveredTasks.reduce((sum, task) => sum + Number(task.fee || 0), 0));
  const rewardsTotal = money(rewards.reduce((sum, reward) => sum + Number(reward.amount || 0), 0));

  return json({
    stats: {
      ordersTotal: orders.length,
      todayOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      activeCouriers: activeCouriers.length,
      productsActive: products.filter((product) => product.is_active).length,
      lowStock: lowStock.length,
      revenue,
      deliveryEarnings,
      rewardsTotal
    },
    categories,
    orders: orders.slice(0, 12),
    tasks: tasks.slice(0, 12),
    couriers,
    products,
    ingredients,
    zones,
    lowStock,
    rewards,
    activeOrders,
    deliveredTasks
  });
}

export default { fetch: (request) => (request.method === "GET" ? GET(request) : methodNotAllowed()) };
