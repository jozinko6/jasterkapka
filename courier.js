const pinInput = document.querySelector("#staffPin");
const courierSelect = document.querySelector("#courierSelect");
const courierList = document.querySelector("#courierList");
const earningsList = document.querySelector("#earningsList");
const availableTasks = document.querySelector("#availableTasks");
const myTasks = document.querySelector("#myTasks");
const courierForm = document.querySelector("#courierForm");
const courierStatus = document.querySelector("#courierStatus");
let couriers = [];
let tasks = [];
let earnings = [];

const actions = {
  queued: [["assigned", "Priradiť"]],
  assigned: [["accepted", "Prijať rozvoz"]],
  accepted: [["arrived_at_restaurant", "Som v prevádzke"]],
  arrived_at_restaurant: [["picked_up", "Vyzdvihnuté"]],
  picked_up: [["near_customer", "Som blízko"]],
  near_customer: [["delivered", "Doručené"]]
};

function staffHeaders() {
  return {
    "content-type": "application/json",
    "x-staff-pin": pinInput.value
  };
}

function setStatus(message, kind = "muted") {
  if (!courierStatus) return;
  courierStatus.textContent = message;
  courierStatus.dataset.kind = kind;
}

function beep() {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 920;
    gain.gain.value = 0.1;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audio.close();
    }, 140);
  } catch {
    // Optional sound.
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...staffHeaders(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function selectedCourierId() {
  return courierSelect.value;
}

function renderCouriers() {
  courierSelect.innerHTML = couriers.map((courier) => `<option value="${courier.id}">${courier.display_name} • ${courier.vehicle_type}</option>`).join("");
  courierList.innerHTML = couriers
    .map(
      (courier) => `
        <div class="table-row">
          <span>
            <strong>${courier.display_name}</strong>
            <span class="muted">${courier.phone || "bez telefónu"} • ${courier.vehicle_type} • ${courier.is_online ? "online" : "offline"}</span>
          </span>
          <button type="button" data-online="${courier.id}" data-value="${!courier.is_online}">${courier.is_online ? "Offline" : "Online"}</button>
        </div>
      `
    )
    .join("");
}

function taskCard(task) {
  const order = task.orders || {};
  const taskActions = actions[task.status] || [];
  return `
    <article class="order-card delivery-card">
      <strong>${task.dropoff_street}, ${task.dropoff_village}</strong>
      <span class="muted">${Number(order.total || 0).toFixed(2)} € • ${order.payment_method || ""} • rozvoz ${Number(task.fee || 0).toFixed(2)} €</span>
      <span class="status-pill">${task.status}</span>
      ${(order.order_items || [])
        .map((item) => `<p><strong>${item.quantity}× ${item.product_name}</strong><br><span class="muted">${[item.variant_name, ...(item.extras || [])].filter(Boolean).join(", ")}</span></p>`)
        .join("")}
      ${order.note ? `<p>${order.note}</p>` : ""}
      <div class="order-actions">
        ${taskActions.map(([status, label]) => `<button type="button" data-task="${task.id}" data-status="${status}">${label}</button>`).join("")}
        <button type="button" data-task="${task.id}" data-status="failed">Problém</button>
      </div>
    </article>
  `;
}

function renderTasks() {
  const courierId = selectedCourierId();
  const mine = tasks.filter((task) => task.courier_id === courierId);
  const available = tasks.filter((task) => !task.courier_id || task.status === "queued");
  availableTasks.innerHTML = available.map(taskCard).join("") || '<p class="muted">Žiadne dostupné rozvozy.</p>';
  myTasks.innerHTML = mine.map(taskCard).join("") || '<p class="muted">Nemáš priradený rozvoz.</p>';
}

async function loadCourierSystem() {
  try {
    setStatus("Načítavam kuriérsky systém...", "muted");
    const [courierData, taskData, earningsData] = await Promise.all([api("/api/courier/couriers"), api("/api/courier/tasks"), api("/api/courier/earnings")]);
    const previousTaskCount = tasks.length;
    couriers = courierData.couriers;
    tasks = taskData.tasks;
    earnings = earningsData.couriers;
    renderCouriers();
    renderTasks();
    renderEarnings();
    setStatus(`Prihlásené: ${couriers.length} kuriérov, ${tasks.length} rozvozov.`, "success");
    if (previousTaskCount && tasks.length > previousTaskCount) beep();
  } catch (error) {
    availableTasks.innerHTML = `<p>${error.message}</p>`;
    myTasks.innerHTML = "";
    earningsList.innerHTML = "";
    setStatus(error.message, "error");
  }
}

function renderEarnings() {
  earningsList.innerHTML = earnings
    .map(
      (entry) => `
        <div class="table-row earnings-row">
          <span>
            <strong>${entry.courier.display_name}</strong>
            <span class="muted">Dnes ${entry.summary.today.deliveries} doručení • týždeň ${entry.summary.week.deliveries} doručení</span>
          </span>
          <strong>${entry.summary.today.total.toFixed(2)} € dnes</strong>
          <strong>${entry.summary.week.total.toFixed(2)} € týždeň</strong>
        </div>
        ${entry.deliveries
          .filter((task) => task.status === "delivered")
          .slice(0, 3)
          .map(
            (task) => `
              <div class="table-row">
                <span>
                  <strong>${task.dropoff_street}, ${task.dropoff_village}</strong>
                  <span class="muted">${new Date(task.delivered_at || task.updated_at).toLocaleString("sk-SK")}</span>
                </span>
                <strong>${Number(task.fee || 0).toFixed(2)} €</strong>
              </div>
            `
          )
          .join("")}
      `
    )
    .join("") || '<p class="muted">Žiadne zárobky.</p>';
}

async function updateTask(taskId, status) {
  const body = { id: taskId, status };
  if (status === "assigned" || status === "accepted") body.courier_id = selectedCourierId();
  if ("geolocation" in navigator && ["picked_up", "near_customer", "delivered"].includes(status)) {
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 }));
      body.lat = position.coords.latitude;
      body.lng = position.coords.longitude;
    } catch {
      // Location is useful for dispatch, but status updates must still work without it.
    }
  }
  await api("/api/courier/tasks", { method: "PATCH", body: JSON.stringify(body) });
  beep();
  loadCourierSystem();
}

document.querySelector("#loadCourier").addEventListener("click", () => {
  beep();
  loadCourierSystem();
});
document.querySelector("#refreshCourier").addEventListener("click", loadCourierSystem);
document.querySelector("#refreshEarnings").addEventListener("click", loadCourierSystem);
courierSelect.addEventListener("change", renderTasks);
pinInput.value = localStorage.getItem("jasterka_staff_pin") || "";
pinInput.addEventListener("input", () => {
  localStorage.setItem("jasterka_staff_pin", pinInput.value);
  setStatus(pinInput.value ? "PIN pripravený." : "Zadaj PIN a spusti smenu.");
});

document.body.addEventListener("click", async (event) => {
  const taskButton = event.target.closest("button[data-task]");
  const onlineButton = event.target.closest("button[data-online]");
  if (taskButton) await updateTask(taskButton.dataset.task, taskButton.dataset.status);
  if (onlineButton) {
    try {
      await api("/api/courier/couriers", {
        method: "PATCH",
        body: JSON.stringify({ id: onlineButton.dataset.online, is_online: onlineButton.dataset.value === "true" })
      });
      loadCourierSystem();
    } catch (error) {
      setStatus(error.message, "error");
    }
  }
});

courierForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/courier/couriers", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(courierForm).entries()))
    });
    courierForm.reset();
    setStatus("Kuriér pridaný.", "success");
    loadCourierSystem();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

setInterval(() => {
  if (pinInput.value) loadCourierSystem();
}, 12000);