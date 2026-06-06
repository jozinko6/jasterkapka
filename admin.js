const pinInput = document.querySelector("#staffPin");
const statsGrid = document.querySelector("#statsGrid");
const ordersList = document.querySelector("#ordersList");
const couriersList = document.querySelector("#couriersList");
const zonesList = document.querySelector("#zonesList");
const rewardsList = document.querySelector("#rewardsList");
const productList = document.querySelector("#productList");
const inventoryList = document.querySelector("#inventoryList");
const productForm = document.querySelector("#productForm");
const productCategory = document.querySelector("#productCategory");
const ingredientForm = document.querySelector("#ingredientForm");
const zoneForm = document.querySelector("#zoneForm");
const rewardForm = document.querySelector("#rewardForm");
const rewardCourier = document.querySelector("#rewardCourier");

let overview = null;

function staffHeaders() {
  return {
    "content-type": "application/json",
    "x-staff-pin": pinInput.value
  };
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...staffHeaders(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function money(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function renderStats() {
  if (!overview) return;
  const stats = overview.stats;
  statsGrid.innerHTML = [
    ["Objednávky", stats.ordersTotal],
    ["Dnes", stats.todayOrders],
    ["Aktívne", stats.activeOrders],
    ["Kuriéri online", stats.activeCouriers],
    ["Aktívne produkty", stats.productsActive],
    ["Sklad pod minimom", stats.lowStock],
    ["Tržba", money(stats.revenue)],
    ["Rozvozy", money(stats.deliveryEarnings)]
  ]
    .map(([label, value]) => `<div class="stat-card"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderOrders() {
  ordersList.innerHTML = overview.orders
    .map(
      (order) => `
        <div class="table-row">
          <span>
            <strong>${order.village}, ${order.street}</strong>
            <span class="muted">${order.status} • ${money(order.total)} • ${order.payment_method} • ${new Date(order.created_at).toLocaleString("sk-SK")}</span>
          </span>
          <span class="status-pill">${order.status}</span>
          <button type="button" data-open-order="${order.id}">Detail</button>
        </div>
      `
    )
    .join("");
}

function courierEarningsMap() {
  const courierStats = new Map();
  for (const task of overview.deliveredTasks) {
    const key = task.courier_id || "unassigned";
    const current = courierStats.get(key) || { deliveries: 0, earnings: 0 };
    current.deliveries += 1;
    current.earnings += Number(task.fee || 0);
    courierStats.set(key, current);
  }
  for (const reward of overview.rewards) {
    const key = reward.courier_id || "unassigned";
    const current = courierStats.get(key) || { deliveries: 0, earnings: 0, rewards: 0 };
    current.rewards = (current.rewards || 0) + Number(reward.amount || 0);
    courierStats.set(key, current);
  }
  return courierStats;
}

function renderCouriers() {
  const stats = courierEarningsMap();
  rewardCourier.innerHTML = overview.couriers
    .map((courier) => `<option value="${courier.id}">${courier.display_name}</option>`)
    .join("");

  couriersList.innerHTML = overview.couriers
    .map((courier) => {
      const stat = stats.get(courier.id) || { deliveries: 0, earnings: 0, rewards: 0 };
      return `
        <div class="table-row">
          <span>
            <strong>${courier.display_name}</strong>
            <span class="muted">${courier.phone || "bez čísla"} • ${courier.vehicle_type} • ${courier.is_active ? "aktívny" : "skrytý"} • ${courier.is_online ? "online" : "offline"}</span>
            <span class="muted">${stat.deliveries} doručení • ${money(stat.earnings + (stat.rewards || 0))}</span>
          </span>
          <button type="button" data-courier-toggle="${courier.id}" data-active="${courier.is_active}">${courier.is_active ? "Deaktivovať" : "Aktivovať"}</button>
          <button type="button" data-courier-online="${courier.id}" data-online="${courier.is_online}">${courier.is_online ? "Offline" : "Online"}</button>
        </div>
      `;
    })
    .join("");
}

function renderZones() {
  zonesList.innerHTML = overview.zones
    .map(
      (zone) => `
        <div class="table-row">
          <span>
            <strong>${zone.village}</strong>
            <span class="muted">${money(zone.fee)} • minimum ${money(zone.minimum_order)} • ${zone.is_active ? "aktívna" : "skrytá"}</span>
          </span>
          <button type="button" data-zone-edit="${zone.id}">Upraviť</button>
          <button type="button" data-zone-toggle="${zone.id}" data-active="${zone.is_active}">${zone.is_active ? "Skryť" : "Zapnúť"}</button>
        </div>
      `
    )
    .join("");
}

function renderRewards() {
  rewardsList.innerHTML = overview.rewards
    .map(
      (reward) => `
        <div class="table-row">
          <span>
            <strong>${reward.reason}</strong>
            <span class="muted">${reward.couriers?.display_name || reward.courier_id} • ${reward.reward_type} • ${new Date(reward.created_at).toLocaleString("sk-SK")}</span>
          </span>
          <strong>${money(reward.amount)}</strong>
        </div>
      `
    )
    .join("");
}

function renderProducts() {
  productCategory.innerHTML = overview.categories
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join("");

  productList.innerHTML = overview.products
    .map(
      (product) => `
        <div class="table-row">
          <span>
            <strong>${product.name}</strong>
            <span class="muted">${product.categories?.name || ""} • ${product.slug} • ${money(product.price)} • ${product.is_active ? "aktívny" : "skrytý"}${product.is_popular ? " • obľúbené" : ""}</span>
          </span>
          <button type="button" data-edit="${product.id}">Upraviť</button>
          <button type="button" data-toggle="${product.id}" data-active="${product.is_active}">${product.is_active ? "Skryť" : "Zapnúť"}</button>
        </div>
      `
    )
    .join("");
}

function renderInventory() {
  inventoryList.innerHTML = overview.ingredients
    .map(
      (item) => `
        <div class="table-row">
          <span>
            <strong>${item.name}</strong>
            <span class="muted">${Number(item.stock_qty)} ${item.unit} • minimum ${Number(item.low_stock_qty)} ${item.unit} • ${item.is_active ? "aktívna" : "skrytá"}</span>
          </span>
        </div>
      `
    )
    .join("");
}

function fillProductForm(product) {
  productForm.elements.id.value = product?.id || "";
  productForm.elements.slug.value = product?.slug || "";
  productForm.elements.category_id.value = product?.category_id || overview.categories[0]?.id || "";
  productForm.elements.name.value = product?.name || "";
  productForm.elements.description.value = product?.description || "";
  productForm.elements.price.value = product?.price ?? 0;
  productForm.elements.icon.value = product?.icon || "+";
  productForm.elements.sort_order.value = product?.sort_order ?? 0;
  productForm.elements.is_active.checked = product ? product.is_active : true;
  productForm.elements.is_popular.checked = Boolean(product?.is_popular);
}

async function loadOverview() {
  statsGrid.innerHTML = "<p>Načítavam...</p>";
  const data = await api("/api/admin/overview");
  overview = data;
  renderStats();
  renderOrders();
  renderCouriers();
  renderZones();
  renderRewards();
  renderProducts();
  renderInventory();
  fillProductForm();
}

productList.addEventListener("click", async (event) => {
  const editId = event.target.dataset.edit;
  const toggleId = event.target.dataset.toggle;
  const product = overview.products.find((item) => item.id === editId);
  if (editId && product) fillProductForm(product);
  if (toggleId) {
    await api("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({ id: toggleId, is_active: event.target.dataset.active !== "true" })
    });
    await loadOverview();
  }
});

ordersList.addEventListener("click", (event) => {
  const id = event.target.dataset.openOrder;
  if (!id) return;
  const order = overview.orders.find((item) => item.id === id);
  if (!order) return;
  fillProductForm();
  alert(`${order.village}, ${order.street}\n${order.status}\n${money(order.total)}\n${order.payment_method}`);
});

couriersList.addEventListener("click", async (event) => {
  const toggleId = event.target.dataset.courierToggle;
  const onlineId = event.target.dataset.courierOnline;
  if (toggleId) {
    const courier = overview.couriers.find((item) => item.id === toggleId);
    await api("/api/courier/couriers", {
      method: "PATCH",
      body: JSON.stringify({ id: toggleId, is_active: !courier.is_active })
    });
    await loadOverview();
  }
  if (onlineId) {
    const courier = overview.couriers.find((item) => item.id === onlineId);
    await api("/api/courier/couriers", {
      method: "PATCH",
      body: JSON.stringify({ id: onlineId, is_online: !courier.is_online })
    });
    await loadOverview();
  }
});

zonesList.addEventListener("click", async (event) => {
  const editId = event.target.dataset.zoneEdit;
  const toggleId = event.target.dataset.zoneToggle;
  if (editId) {
    const zone = overview.zones.find((item) => item.id === editId);
    zoneForm.elements.village.value = zone.village;
    zoneForm.elements.fee.value = zone.fee;
    zoneForm.elements.minimum_order.value = zone.minimum_order;
    zoneForm.elements.sort_order.value = zone.sort_order;
    zoneForm.elements.is_active.checked = zone.is_active;
    zoneForm.dataset.editId = zone.id;
  }
  if (toggleId) {
    const zone = overview.zones.find((item) => item.id === toggleId);
    await api("/api/admin/zones", {
      method: "PATCH",
      body: JSON.stringify({ id: toggleId, is_active: event.target.dataset.active !== "true" })
    });
    await loadOverview();
  }
});

zoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(zoneForm);
  const body = Object.fromEntries(form.entries());
  body.fee = Number(body.fee || 0);
  body.minimum_order = Number(body.minimum_order || 0);
  body.sort_order = Number(body.sort_order || 0);
  body.is_active = form.get("is_active") === "on";
  if (zoneForm.dataset.editId) {
    body.id = zoneForm.dataset.editId;
    await api("/api/admin/zones", { method: "PATCH", body: JSON.stringify(body) });
  } else {
    await api("/api/admin/zones", { method: "POST", body: JSON.stringify(body) });
  }
  zoneForm.reset();
  zoneForm.dataset.editId = "";
  await loadOverview();
});

rewardForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(rewardForm);
  await api("/api/admin/rewards", {
    method: "POST",
    body: JSON.stringify({
      courier_id: form.get("courier_id"),
      amount: Number(form.get("amount")),
      reason: form.get("reason"),
      reward_type: form.get("reward_type")
    })
  });
  rewardForm.reset();
  await loadOverview();
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(productForm);
  const payload = {
    slug: form.get("slug"),
    category_id: form.get("category_id"),
    name: form.get("name"),
    description: form.get("description"),
    price: Number(form.get("price")),
    icon: form.get("icon"),
    sort_order: Number(form.get("sort_order") || 0),
    is_active: form.get("is_active") === "on",
    is_popular: form.get("is_popular") === "on"
  };

  if (form.get("id")) {
    await api("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({ id: form.get("id"), ...payload })
    });
  } else {
    await api("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  await loadOverview();
  fillProductForm();
});

ingredientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(ingredientForm);
  await api("/api/admin/inventory", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(form.entries()))
  });
  ingredientForm.reset();
  await loadOverview();
});

document.querySelector("#loadAdmin").addEventListener("click", loadOverview);
document.querySelector("#refreshOverview").addEventListener("click", loadOverview);
document.querySelector("#refreshOrders").addEventListener("click", loadOverview);
document.querySelector("#refreshCouriers").addEventListener("click", loadOverview);
document.querySelector("#refreshZones").addEventListener("click", loadOverview);
document.querySelector("#refreshRewards").addEventListener("click", loadOverview);
document.querySelector("#refreshProducts").addEventListener("click", loadOverview);
document.querySelector("#refreshInventory").addEventListener("click", loadOverview);
