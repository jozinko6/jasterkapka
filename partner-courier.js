const phoneForm = document.querySelector("#phoneForm");
const phoneInput = document.querySelector("#phoneInput");
const authMessage = document.querySelector("#authMessage");
const loginView = document.querySelector("#loginView");
const workView = document.querySelector("#workView");
const onlineToggle = document.querySelector("#onlineToggle");
const offersPanel = document.querySelector("#offersPanel");
const minePanel = document.querySelector("#minePanel");
const refreshTasks = document.querySelector("#refreshTasks");
const todayCount = document.querySelector("#todayCount");
const todayEarnings = document.querySelector("#todayEarnings");
const weekEarnings = document.querySelector("#weekEarnings");
const courierState = document.querySelector("#courierState");
const historyPanel = document.querySelector("#historyPanel");

let session = JSON.parse(localStorage.getItem("partnerCourierSession") || "null");
let tasks = [];
let earnings = null;

function token() {
  return session?.access_token;
}

function headers() {
  return {
    "content-type": "application/json",
    ...(token() ? { authorization: `Bearer ${token()}` } : {})
  };
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function setMessage(message) {
  authMessage.textContent = message;
}

function showWork() {
  loginView.hidden = true;
  workView.hidden = false;
  refreshTasks.hidden = false;
  onlineToggle.disabled = false;
  onlineToggle.classList.add("online");
  onlineToggle.textContent = "Online";
}

function actionFor(task) {
  if (task.status === "queued") return [["accepted", "Prijať ponuku", "wide"]];
  if (task.status === "assigned") return [["accepted", "Prijať rozvoz", "wide"]];
  if (task.status === "accepted") return [["arrived_at_restaurant", "Som v prevádzke", "wide"]];
  if (task.status === "arrived_at_restaurant") return [["picked_up", "Vyzdvihnuté", "wide"]];
  if (task.status === "picked_up") return [["near_customer", "Som blízko", ""], ["delivered", "Doručené", ""]];
  if (task.status === "near_customer") return [["delivered", "Doručené", "wide"]];
  return [];
}

function taskCard(task) {
  const order = task.orders || {};
  const actions = actionFor(task);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${task.dropoff_street}, ${task.dropoff_village}`)}`;
  return `
    <article class="task-card">
      <header>
        <div>
          <strong>${task.dropoff_village}</strong>
          <span class="task-meta">${task.status} • ${order.payment_method || "cash"}</span>
        </div>
        <span class="task-fee">${Number(task.fee || 0).toFixed(2)} €</span>
      </header>
      <div class="task-route">
        <div class="route-line">
          <span class="route-dot"></span>
          <div><strong>Pizza Jašterka</strong><small>Vyzdvihnutie v prevádzke</small></div>
        </div>
        <div class="route-line">
          <span class="route-dot drop"></span>
          <div><strong>${task.dropoff_street}</strong><small>${task.dropoff_village}</small></div>
        </div>
      </div>
      <p class="task-meta">${(order.order_items || []).map((item) => `${item.quantity}× ${item.product_name}`).join(", ")}</p>
      <div class="task-actions">
        <a class="nav-action ghost wide" href="${mapsUrl}" target="_blank" rel="noreferrer">Navigovať</a>
        ${actions.map(([status, label, wide]) => `<button class="${wide}" type="button" data-task="${task.id}" data-status="${status}">${label}</button>`).join("")}
      </div>
    </article>
  `;
}

function renderTasks() {
  const mine = tasks.filter((task) => task.status !== "queued");
  const offers = tasks.filter((task) => task.status === "queued");
  offersPanel.innerHTML = offers.map(taskCard).join("") || '<p class="empty-state">Žiadne nové ponuky rozvozu.</p>';
  minePanel.innerHTML = mine.map(taskCard).join("") || '<p class="empty-state">Nemáš aktívny rozvoz.</p>';
}

function renderEarnings() {
  if (!earnings) return;
  todayCount.textContent = `${earnings.summary.today.deliveries} rozvozov`;
  todayEarnings.textContent = `${earnings.summary.today.total.toFixed(2)} €`;
  weekEarnings.textContent = `${earnings.summary.week.total.toFixed(2)} €`;

  const delivered = earnings.deliveries.filter((task) => task.status === "delivered");
  const rewards = earnings.rewards || [];
  historyPanel.innerHTML = `
    <div class="earning-row">
      <span><strong>Tento týždeň</strong><small>${earnings.summary.week.deliveries} doručení + bonusy</small></span>
      <strong>${earnings.summary.week.total.toFixed(2)} €</strong>
    </div>
    <div class="earning-row">
      <span><strong>Celkom</strong><small>${earnings.summary.allTime.deliveries} doručení</small></span>
      <strong>${earnings.summary.allTime.total.toFixed(2)} €</strong>
    </div>
    ${rewards
      .map(
        (reward) => `
          <div class="earning-row">
            <span><strong>${reward.reason}</strong><small>${new Date(reward.created_at).toLocaleDateString("sk-SK")} • ${reward.reward_type}</small></span>
            <strong>${Number(reward.amount).toFixed(2)} €</strong>
          </div>
        `
      )
      .join("")}
    ${delivered
      .map(
        (task) => `
          <div class="earning-row">
            <span><strong>${task.dropoff_street}, ${task.dropoff_village}</strong><small>${new Date(task.delivered_at || task.updated_at).toLocaleString("sk-SK")}</small></span>
            <strong>${Number(task.fee || 0).toFixed(2)} €</strong>
          </div>
        `
      )
      .join("")}
    ${!delivered.length && !rewards.length ? '<p class="empty-state">Zatiaľ nemáš doručené objednávky.</p>' : ""}
  `;
}

async function loadTasks() {
  const [taskData, earningsData] = await Promise.all([api("/api/partner/tasks"), api("/api/partner/earnings")]);
  tasks = taskData.tasks;
  earnings = earningsData;
  showWork();
  courierState.textContent = taskData.courier?.is_online ? "Online a pripravený prijímať rozvozy" : "Pripravený";
  renderTasks();
  renderEarnings();
}

async function updateTask(taskId, status) {
  const body = { id: taskId, status };
  if ("geolocation" in navigator && ["picked_up", "near_customer", "delivered"].includes(status)) {
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 }));
      body.lat = position.coords.latitude;
      body.lng = position.coords.longitude;
    } catch {
      // Status changes still work when location permission is denied.
    }
  }
  await api("/api/partner/tasks", { method: "PATCH", body: JSON.stringify(body) });
  await loadTasks();
}

phoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const phone = phoneInput.value.trim();
  try {
    const data = await api("/api/partner/auth/start", { method: "POST", body: JSON.stringify({ phone }) });
    session = data.session;
    localStorage.setItem("partnerCourierSession", JSON.stringify(session));
    await loadTasks();
  } catch (error) {
    setMessage(error.message);
  }
});

document.body.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-task]");
  if (!button) return;
  await updateTask(button.dataset.task, button.dataset.status);
});

document.querySelectorAll(".partner-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".partner-tabs button").forEach((item) => item.classList.toggle("active", item === button));
    offersPanel.hidden = button.dataset.tab !== "offers";
    minePanel.hidden = button.dataset.tab !== "mine";
    document.querySelector("#historyPanel").hidden = button.dataset.tab !== "history";
  });
});

onlineToggle.addEventListener("click", () => {
  onlineToggle.classList.toggle("online");
  const online = onlineToggle.classList.contains("online");
  onlineToggle.textContent = online ? "Online" : "Offline";
  courierState.textContent = online ? "Online" : "Offline";
});

refreshTasks.addEventListener("click", loadTasks);

if (session?.access_token) {
  loadTasks().catch(() => localStorage.removeItem("partnerCourierSession"));
}
