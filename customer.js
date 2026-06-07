const storageKey = "jasterka_customer_profile";
const checkoutPanel = document.querySelector(".checkout-panel");
if (!checkoutPanel) throw new Error("Checkout panel not found");

const originalFetch = window.fetch.bind(window);
let lookupTimer = null;
let profile = {
  name: "",
  phone: "",
  email: "",
  registerAccount: true,
  newsletterOptIn: false,
  loyaltyPoints: 0,
  registeredAt: null
};

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `+${digits.slice(1).replace(/\D/g, "")}`;
  const cleaned = digits.replace(/\D/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("0")) return `+421${cleaned.slice(1)}`;
  return `+${cleaned}`;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function loadSavedProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    profile = { ...profile, ...saved };
  } catch {
    // Local cache is optional.
  }
}

function saveProfile() {
  localStorage.setItem(storageKey, JSON.stringify(profile));
}

function ensureStyles() {
  if (document.querySelector("#customer-style")) return;
  const style = document.createElement("style");
  style.id = "customer-style";
  style.textContent = `
    .customer-panel {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
    }
    .customer-panel h3 {
      margin: 0 0 4px;
      font-size: 15px;
    }
    .customer-grid {
      display: grid;
      gap: 10px;
    }
    .customer-field,
    .customer-check {
      display: grid;
      gap: 6px;
      font-size: 13px;
      font-weight: 800;
    }
    .customer-check {
      grid-template-columns: 20px 1fr;
      align-items: center;
    }
    .customer-field input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px 14px;
      background: #fff;
      color: var(--ink);
    }
    .customer-info {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.35;
    }
    .customer-info strong {
      color: var(--ink);
    }
  `;
  document.head.appendChild(style);
}

function renderCustomerPanel() {
  if (document.querySelector("#customerPanel")) return;
  const panel = document.createElement("section");
  panel.id = "customerPanel";
  panel.className = "customer-panel";
  panel.innerHTML = `
    <h3>Registrovaný účet</h3>
    <div class="customer-grid">
      <label class="customer-field">
        Meno a priezvisko
        <input id="customerName" autocomplete="name" required placeholder="Tvoje meno" />
      </label>
      <label class="customer-field">
        Telefón
        <input id="customerPhone" autocomplete="tel" inputmode="tel" required placeholder="+421..." />
      </label>
      <label class="customer-field">
        Email (voliteľný)
        <input id="customerEmail" autocomplete="email" inputmode="email" placeholder="meno@email.sk" />
      </label>
      <label class="customer-check">
        <input id="customerRegister" type="checkbox" checked />
        <span>Registrovať účet a vernostný program</span>
      </label>
      <label class="customer-check">
        <input id="customerNewsletter" type="checkbox" />
        <span>Chcem newsletter</span>
      </label>
      <p class="customer-info" id="customerInfo">Pri registrovanom účte sa zbierajú body za objednávky.</p>
    </div>
  `;
  checkoutPanel.insertBefore(panel, checkoutPanel.firstChild);
}

function syncInputsFromProfile() {
  const nameInput = document.querySelector("#customerName");
  const phoneInput = document.querySelector("#customerPhone");
  const emailInput = document.querySelector("#customerEmail");
  const registerInput = document.querySelector("#customerRegister");
  const newsletterInput = document.querySelector("#customerNewsletter");
  if (!nameInput || !phoneInput || !emailInput || !registerInput || !newsletterInput) return;

  nameInput.value = profile.name || "";
  phoneInput.value = profile.phone || "";
  emailInput.value = profile.email || "";
  registerInput.checked = profile.registerAccount !== false;
  newsletterInput.checked = Boolean(profile.newsletterOptIn);
  newsletterInput.disabled = !emailInput.value.trim();
  updateCustomerInfo();
}

function updateCustomerInfo(message) {
  const info = document.querySelector("#customerInfo");
  if (!info) return;
  if (message) {
    info.textContent = message;
    return;
  }
  if (profile.registeredAt) {
    info.innerHTML = `Účet je aktívny. Vernostné body: <strong>${Number(profile.loyaltyPoints || 0)}</strong>.`;
  } else {
    info.textContent = "Pri registrovanom účte sa zbierajú body za objednávky.";
  }
}

function currentCustomerPayload() {
  const nameInput = document.querySelector("#customerName");
  const phoneInput = document.querySelector("#customerPhone");
  const emailInput = document.querySelector("#customerEmail");
  const registerInput = document.querySelector("#customerRegister");
  const newsletterInput = document.querySelector("#customerNewsletter");
  return {
    name: nameInput?.value.trim() || "",
    phone: normalizePhone(phoneInput?.value || ""),
    email: normalizeEmail(emailInput?.value || ""),
    registerAccount: Boolean(registerInput?.checked),
    newsletterOptIn: Boolean(newsletterInput?.checked)
  };
}

async function lookupCustomer() {
  const phone = normalizePhone(document.querySelector("#customerPhone")?.value || "");
  if (!phone || phone.length < 9) return;
  try {
    const response = await fetch(`/api/customers?phone=${encodeURIComponent(phone)}`);
    if (!response.ok) return;
    const data = await response.json();
    if (!data.customer) return;
    profile = {
      ...profile,
      name: data.customer.name || profile.name,
      phone: data.customer.phone || phone,
      email: data.customer.email || profile.email,
      newsletterOptIn: Boolean(data.customer.newsletter_opt_in),
      loyaltyPoints: Number(data.customer.loyalty_points || 0),
      registeredAt: data.customer.registered_at || profile.registeredAt
    };
    saveProfile();
    syncInputsFromProfile();
    updateCustomerInfo(`Účet načítaný. Vernostné body: ${Number(profile.loyaltyPoints || 0)}.`);
  } catch {
    // Lookup is best effort.
  }
}

function bindCustomerEvents() {
  const nameInput = document.querySelector("#customerName");
  const phoneInput = document.querySelector("#customerPhone");
  const emailInput = document.querySelector("#customerEmail");
  const registerInput = document.querySelector("#customerRegister");
  const newsletterInput = document.querySelector("#customerNewsletter");
  const checkoutButton = document.querySelector("#checkoutButton");

  const saveFromInputs = () => {
    profile = { ...profile, ...currentCustomerPayload() };
    saveProfile();
    newsletterInput.disabled = !emailInput.value.trim();
    if (newsletterInput.disabled) newsletterInput.checked = false;
    updateCustomerInfo();
  };

  [nameInput, phoneInput, emailInput, registerInput, newsletterInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      saveFromInputs();
      if (input === phoneInput) {
        clearTimeout(lookupTimer);
        lookupTimer = setTimeout(lookupCustomer, 300);
      }
    });
    input.addEventListener("change", saveFromInputs);
  });

  checkoutButton?.addEventListener(
    "click",
    (event) => {
      const payload = currentCustomerPayload();
      if (!payload.name || !payload.phone) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!payload.name) nameInput?.reportValidity();
        if (!payload.phone) phoneInput?.reportValidity();
        updateCustomerInfo("Pre objednanie vyplň meno a telefón.");
        return;
      }
      if (payload.newsletterOptIn && !payload.email) {
        event.preventDefault();
        event.stopImmediatePropagation();
        emailInput?.reportValidity();
        updateCustomerInfo("Pre newsletter doplň email.");
        return;
      }
      profile = { ...profile, ...payload };
      saveProfile();
    },
    true
  );
}

function patchFetch() {
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const isOrdersPost = url.includes("/api/orders") && (!init.method || init.method === "POST");
    if (isOrdersPost) {
      try {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
        if (body && !body.customer) {
          body.customer = currentCustomerPayload();
          init = {
            ...init,
            headers: { "content-type": "application/json", ...(init.headers || {}) },
            body: JSON.stringify(body)
          };
        }
      } catch {
        // Leave body unchanged if it is not JSON.
      }
    }
    return originalFetch(input, init);
  };
}

loadSavedProfile();
ensureStyles();
renderCustomerPanel();
syncInputsFromProfile();
bindCustomerEvents();
patchFetch();
