const pinInput = document.querySelector("#staffPin");
const ordersBoard = document.querySelector("#ordersBoard");
let lastOrderIds = new Set();

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
              (order) => `
                <article class="order-card">
                  <strong>${new Date(order.created_at).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })} • ${Number(order.total).toFixed(2)} €</strong>
                  <span class="muted">${order.street}, ${order.village} • ${order.payment_method}</span>
                  ${(order.order_items || [])
                    .map((item) => `<p><strong>${item.quantity}× ${item.product_name}</strong><br><span class="muted">${[item.variant_name, ...(item.extras || [])].filter(Boolean).join(", ")}</span></p>`)
                    .join("")}
                  ${order.note ? `<p>${order.note}</p>` : ""}
                  <div class="order-actions">
                    ${column.actions.map(([status, label]) => `<button type="button" data-id="${order.id}" data-status="${status}">${label}</button>`).join("")}
                    <button type="button" data-id="${order.id}" data-status="cancelled">Zrušiť</button>
                  </div>
                </article>
              `
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
    renderOrders(data.orders);
  } catch (error) {
    ordersBoard.innerHTML = `<p>${error.message}</p>`;
  }
}

ordersBoard.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
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
