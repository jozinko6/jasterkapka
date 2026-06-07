const pinInput = document.querySelector("#staffPin");
const ordersBoard = document.querySelector("#ordersBoard");
let lastOrderIds = new Set();
let couriers = [];

const columns = [
  { status: "new", title: "Nové", actions: [["accepted", "Prijať"]] },
  { status: "accepted", title: "Prijaté", actions: [["preparing", "Príprava"]] },
  { status: "preparing", title: "Príprava", actions: [["baking", "Do pece"], ["packing", "Baliť"]] },
  { status: "baking", title: "Pec / výdaj", actions: [["packing", "Zabalené pre kuriéra"], ["ready_for_pickup", "Na vyzdvihnutie"], ["completed", "Hotovo"]] }
];

function staffHeaders() {
  return {
    "content-type": "application/json",
    "x-staff-pin": pinInput.value
  };
}

function beep() {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 740;
    gain.gain.value = 0.12;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audio.close();
    }, 180);
  } catch {
    // Sound depends on browser permission/user gesture.
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...staffHeaders(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function assignedCourier(order) {
  const task = Array.isArray(order.delivery_tasks) ? order.delivery_tasks[0] : order.delivery_tasks;
  return task?.couriers || null;
}

function courierOptions(order) {
  const currentCourier = assignedCourier(order);
  return couriers.filter((courier) => courier.is_available || courier.id === currentCourier?.id);
}

function renderCourierAssignment(order) {
  const options = courierOptions(order);
  const currentCourier = assignedCourier(order);
  if (!["packing", "baking", "ready_for_pickup", "out_for_delivery"].includes(order.status)) return "";
  if (!options.length) {
    return '<p class="muted">Žiadny dostupný kuriér.</p>';
  }
  return `
    <div class="assign-row">
      <label>
        Kuriér
        <select data-courier-select="${order.id}">
          ${options
            .map(
              (courier) => `
                <option value="${courier.id}" ${courier.id === currentCourier?.id ? "selected" : ""}>
                  ${courier.display_name} • ${courier.vehicle_type} • ${courier.availability_reason}
                </option>
              `
            )
            .join("")}
        </select>
      </label>
      <button type="button" data-assign-order="${order.id}">${currentCourier ? "Zmeniť kuriéra" : "Priradiť kuriéra"}</button>
    </div>
  `;
}

function renderOrders(orders) {
  const currentIds = new Set(orders.map((order) => order.id));
  if ([...currentIds].some((id) => !lastOrderIds.has(id)) && lastOrderIds.size) beep();
  lastOrderIds = currentIds;

  ordersBoard.innerHTML = columns
    .map((column) => {
      const items = orders.filter((order) => order.status === column.status || (column.status === "baking" && ["packing", "out_for_delivery", "ready_for_pickup"].includes(order.status)));
      return `
        <section class="staff-panel">
          <h2>${column.title}</h2>
          ${items
            .map(
              (order) => {
                const courier = assignedCourier(order);
                return `
                <article class="order-card">
                  <strong>${new Date(order.created_at).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })} • ${Number(order.total).toFixed(2)} €</strong>
                  <span class="muted">${order.street}, ${order.village} • ${order.payment_method}</span>
                  ${courier ? `<span class="status-pill">Kuriér: ${courier.display_name} • ${courier.vehicle_type}</span>` : ""}
                  ${(order.order_items || [])
                    .map((item) => `<p><strong>${item.quantity}× ${item.product_name}</strong><br><span class="muted">${[item.variant_name, ...(item.extras || [])].filter(Boolean).join(", ")}</span></p>`)
                    .join("")}
                  ${order.note ? `<p>${order.note}</p>` : ""}
                  ${renderCourierAssignment(order)}
                  <div class="order-actions">
                    ${column.actions.map(([status, label]) => `<button type="button" data-id="${order.id}" data-status="${status}">${label}</button>`).join("")}
                    <button type="button" data-id="${order.id}" data-status="cancelled">Zrušiť</button>
                  </div>
                </article>
              `;
              }
            )
            .join("") || '<p class="muted">Žiadne objednávky.</p>'}
        </section>
      `;
    })
    .join("");
}

async function loadOrders() {
  ordersBoard.innerHTML = "<p>Načítavam...</p>";
  try {
    const data = await api("/api/kitchen/orders");
    couriers = data.couriers || [];
    renderOrders(data.orders || []);
  } catch (error) {
    ordersBoard.innerHTML = `<p>${error.message}</p>`;
  }
}

ordersBoard.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  const assignButton = event.target.closest("button[data-assign-order]");
  if (assignButton) {
    const orderId = assignButton.dataset.assignOrder;
    const select = document.querySelector(`select[data-courier-select="${orderId}"]`);
    await api("/api/kitchen/orders", {
      method: "PATCH",
      body: JSON.stringify({ id: orderId, status: "out_for_delivery", courier_id: select.value })
    });
    loadOrders();
    return;
  }
  if (!button) return;
  await api("/api/kitchen/orders", {
    method: "PATCH",
    body: JSON.stringify({ id: button.dataset.id, status: button.dataset.status })
  });
  loadOrders();
});

document.querySelector("#loadOrders").addEventListener("click", () => {
  beep();
  loadOrders();
});
document.querySelector("#refreshOrders").addEventListener("click", loadOrders);
setInterval(() => {
  if (pinInput.value) loadOrders();
}, 15000);