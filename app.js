const deliveryLocations = [
  { village: "Hlohovec", fee: 0, minimum: 0 },
  { village: "Šulekovo", fee: 2, minimum: 20 },
  { village: "Leopoldov", fee: 2, minimum: 20 },
  { village: "Koplotovce", fee: 3, minimum: 20 },
  { village: "Červeník", fee: 3, minimum: 20 },
  { village: "Bojničky", fee: 3, minimum: 20 },
  { village: "Kľačany", fee: 4, minimum: 20 },
  { village: "Tepličky", fee: 4, minimum: 20 },
  { village: "Dvorníky", fee: 4, minimum: 20 },
  { village: "Otrokovce", fee: 4, minimum: 20 },
  { village: "Trhovište", fee: 4, minimum: 20 },
  { village: "Sasinkovo", fee: 4.5, minimum: 20 }
];

const pizzaExtras = [
  { name: "Šampiňóny 70g", price: 1 },
  { name: "Kukurica 50g", price: 1 },
  { name: "Ananás 50g", price: 1 },
  { name: "Brokolica 50g", price: 1 },
  { name: "Olivy 40g", price: 1 },
  { name: "Baranie rohy 50g", price: 1 },
  { name: "Cibuľa 30g", price: 1 },
  { name: "Paprika 50g", price: 1 },
  { name: "Paradajky 70g", price: 1 },
  { name: "Feferóny 20g", price: 1 },
  { name: "Rucola 40g", price: 1 },
  { name: "Vajce 40g", price: 1 },
  { name: "Šunka 50g", price: 1.3 },
  { name: "Salám 50g", price: 1.3 },
  { name: "Pikantný salám 50g", price: 1.3 },
  { name: "Klobása 50g", price: 1.3 },
  { name: "Slanina 50g", price: 1.3 },
  { name: "Kuracie mäso 70g", price: 1.5 },
  { name: "Kečup 80ml", price: 1.5 },
  { name: "Tatárska omáčka 80ml", price: 1.5 },
  { name: "Cesnakový dresing 80ml", price: 1.5 },
  { name: "Americký dresing 80ml", price: 1.5 },
  { name: "Pikantný dresing 80ml", price: 1.5 },
  { name: "Slaninový dresing 80ml", price: 1.5 },
  { name: "Sweet chilli omáčka 80ml", price: 1.5 },
  { name: "Mozzarella 80g", price: 1.8 },
  { name: "Niva 80g", price: 1.8 },
  { name: "Údený syr 80g", price: 1.8 },
  { name: "Hermelín 80g", price: 1.8 },
  { name: "Tuniak 50g", price: 2 },
  { name: "Prosciutto 50g", price: 2 },
  { name: "Parmezán 50g", price: 2.5 }
];

const dressingExtras = pizzaExtras.filter((extra) => extra.name.includes("80ml") || extra.name.includes("omáčka"));
const baseVariants = [{ name: "Rajčinový základ", price: 0 }, { name: "Smotanový základ", price: 0 }];

let products = [
  { id: "pizza-01", category: "Pizza", name: "1. Margerita", description: "Pomodoro, bazalka, syr. 530g, alergény: 1,7.", price: 7.2, icon: "1", popular: true, variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-02", category: "Pizza", name: "2. Šunková", description: "Pomodoro, šunka, syr. 580g, alergény: 1,7.", price: 7.9, icon: "2", popular: true, variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-03", category: "Pizza", name: "3. Salámová", description: "Pomodoro, salám, syr. 580g, alergény: 1,7.", price: 7.9, icon: "3", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-04", category: "Pizza", name: "4. Šampiňónová", description: "Pomodoro, šunka, šampiňóny, syr. 650g, alergény: 1,7.", price: 7.9, icon: "4", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-05", category: "Pizza", name: "5. Študentská", description: "Pomodoro, šunka, kukurica, syr. 630g, alergény: 1,7.", price: 7.9, icon: "5", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-06", category: "Pizza", name: "6. Hawai", description: "Pomodoro, šunka, ananás, syr. 630g, alergény: 1,7.", price: 7.9, icon: "6", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-07", category: "Pizza", name: "7. Quatro Formaggi", description: "Pomodoro, 4 druhy syra: niva, údený syr, mozarella, eidam. 720g, alergény: 1,7.", price: 9, icon: "7", popular: true, variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-08", category: "Pizza", name: "8. Provinciále", description: "Pomodoro, šunka, kukurica, šampiňóny, feferóny, slanina, syr. 680g, alergény: 1,7.", price: 8.4, icon: "8", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-09", category: "Pizza", name: "9. Gazdovská", description: "Pomodoro, salám, klobása, slanina, cibuľa, feferóny, syr. 710g, alergény: 1,7.", price: 8.8, icon: "9", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-10", category: "Pizza", name: "10. Diavola", description: "Pomodoro, šunka, pikantný salám, chilli, paprika, syr. 680g, alergény: 1,7.", price: 8.3, icon: "10", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-11", category: "Pizza", name: "11. Pikante", description: "Pomodoro, pikantný salám, chilli, cibuľa, syr. 630g, alergény: 1,7.", price: 8.3, icon: "11", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-12", category: "Pizza", name: "12. Vegetariánska", description: "Pomodoro, šampiňóny, kukurica, brokolica, paradajky, olivy, syr. 710g, alergény: 1,7.", price: 8.5, icon: "12", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-13", category: "Pizza", name: "13. Špek", description: "Pomodoro, šunka, kukurica, slanina, tavený syr, syr. 650g, alergény: 1,7.", price: 8.4, icon: "13", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-14", category: "Pizza", name: "14. Talianská", description: "Pomodoro, paradajky, prosciutto, rucola, parmezán, syr. 580g, alergény: 1,7.", price: 9.5, icon: "14", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-15", category: "Pizza", name: "15. Tuniaková", description: "Pomodoro, tuniak, cibuľa, olivy, syr. 630g, alergény: 1,4,7.", price: 8.4, icon: "15", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-16", category: "Pizza", name: "16. Hermelínová", description: "Pomodoro, šunka, hermelín, syr, brusnicová omáčka. 650g, alergény: 1,7.", price: 8.6, icon: "16", variants: baseVariants, extras: pizzaExtras },
  { id: "pizza-17", category: "Pizza", name: "17. Jašterka", description: "Pomodoro, kuracie mäso, niva, hermelín, rucola, syr, sweet chilli omáčka. 710g, alergény: 1,7.", price: 9.9, icon: "17", popular: true, variants: baseVariants, extras: pizzaExtras },
  { id: "stangle-01", category: "Pizza štangle", name: "1. Pizza štangle s dresingom", description: "250g, alergény: 1,3,7.", price: 4.5, icon: "Š1", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  { id: "stangle-02", category: "Pizza štangle", name: "2. Pizza štangle syrové", description: "Pomodoro, syr. 450g, alergény: 1,7.", price: 7.2, icon: "Š2", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  { id: "stangle-03", category: "Pizza štangle", name: "3. Pizza štangle šunkové", description: "Pomodoro, šunka, syr. 470g, alergény: 1,7.", price: 7.4, icon: "Š3", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  { id: "stangle-04", category: "Pizza štangle", name: "4. Pizza štangle slaninové", description: "Pomodoro, slanina, údený syr. 470g, alergény: 1,7.", price: 7.8, icon: "Š4", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  { id: "stangle-05", category: "Pizza štangle", name: "5. Pizza štangle nivové", description: "Pomodoro, slanina, niva. 470g, alergény: 1,7.", price: 8, icon: "Š5", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  { id: "stangle-06", category: "Pizza štangle", name: "6. Pizza štangle gazdovské", description: "Pomodoro, slanina, klobása, kukurica, syr. 500g, alergény: 1,7.", price: 8.6, icon: "Š6", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  { id: "focaccio-01", category: "Focaccio", name: "1. Focaccio s kuracím mäsom", description: "Dresing, zelenina, kuracie mäso. 2ks 500g, alergény: 1,3,7.", price: 8.2, icon: "F1", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  { id: "focaccio-02", category: "Focaccio", name: "2. Focaccio s prosciuttom", description: "Dresing, šalát, mozzarella, prosciutto. 2ks 480g, alergény: 1,3,7.", price: 9.3, icon: "F2", variants: [{ name: "Štandard", price: 0 }], extras: dressingExtras },
  ...pizzaExtras.map((extra, index) => ({
    id: `extra-${index + 1}`,
    category: "Prílohy",
    name: extra.name,
    description: "Samostatná príloha alebo doplnok k jedlu.",
    price: extra.price,
    icon: "+",
    variants: [{ name: "1 porcia", price: 0 }],
    extras: []
  }))
];

let categories = ["Všetko", ...new Set(products.map((product) => product.category))];
const state = {
  activeCategory: "Všetko",
  search: "",
  cart: [],
  lastOrder: null,
  currentProduct: null,
  currentVariant: 0,
  currentExtras: new Set(),
  currentQty: 1,
  payMethod: "card",
  deliveryVillage: "Hlohovec"
};

const categoryTabs = document.querySelector("#categoryTabs");
const menuList = document.querySelector("#menuList");
const searchPanel = document.querySelector("#searchPanel");
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const productSheet = document.querySelector("#productSheet");
const cartSheet = document.querySelector("#cartSheet");
const cartBar = document.querySelector("#cartBar");
const deliveryVillage = document.querySelector("#deliveryVillage");
const deliveryStreet = document.querySelector("#deliveryStreet");
const deliveryRule = document.querySelector("#deliveryRule");
const checkoutButton = document.querySelector("#checkoutButton");
const orderProgress = document.querySelector("#orderProgress");
const orderStatusLabel = document.querySelector("#orderStatusLabel");
const orderStatusMessage = document.querySelector("#orderStatusMessage");
const orderProgressBar = document.querySelector("#orderProgressBar");
const enableNotifications = document.querySelector("#enableNotifications");

const currency = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR"
});

function uniqueId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatPrice(value) {
  return currency.format(value);
}

function selectedExtras() {
  return state.currentProduct.extras.filter((extra) => state.currentExtras.has(extra.name));
}

function selectedDeliveryLocation() {
  return deliveryLocations.find((location) => location.village === state.deliveryVillage) || deliveryLocations[0];
}

function renderDeliveryLocations() {
  deliveryVillage.innerHTML = deliveryLocations
    .map(
      (location) =>
        `<option value="${location.village}">${location.village} - ${location.fee ? formatPrice(location.fee) : "bez poplatku"}</option>`
    )
    .join("");
  deliveryVillage.value = state.deliveryVillage;
}

const statusSteps = {
  new: { label: "Prijatá", percent: 12, message: "Objednávka čaká na potvrdenie kuchyňou." },
  accepted: { label: "Potvrdená", percent: 25, message: "Kuchyňa objednávku prijala." },
  preparing: { label: "Príprava", percent: 42, message: "Objednávka sa pripravuje." },
  baking: { label: "V peci", percent: 58, message: "Pizza je v peci." },
  packing: { label: "Balenie", percent: 74, message: "Objednávka sa balí." },
  out_for_delivery: { label: "Kuriér na ceste", percent: 88, message: "Kuriér prevzal objednávku a smeruje k tebe." },
  ready_for_pickup: { label: "Pripravená", percent: 88, message: "Objednávka je pripravená." },
  completed: { label: "Dokončená", percent: 100, message: "Objednávka bola dokončená." },
  cancelled: { label: "Zrušená", percent: 100, message: "Objednávka bola zrušená." }
};

function playStatusSound() {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audio.close();
    }, 140);
  } catch {
    // Audio is optional and depends on browser permissions/user gesture.
  }
}

function renderOrderStatus(status, message) {
  const step = statusSteps[status] || statusSteps.new;
  orderProgress.hidden = false;
  orderStatusLabel.textContent = step.label;
  orderStatusMessage.textContent = message || step.message;
  orderProgressBar.style.width = `${step.percent}%`;
}

async function pollOrderStatus() {
  if (!state.lastOrder?.id || !state.lastOrder?.token) return;
  try {
    const response = await fetch(`/api/orders/${state.lastOrder.id}?token=${state.lastOrder.token}`);
    if (!response.ok) return;
    const data = await response.json();
    const latestEvent = [...(data.order.order_events || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    const nextStatus = data.order.status;
    if (nextStatus !== state.lastOrder.status) playStatusSound();
    state.lastOrder.status = nextStatus;
    renderOrderStatus(nextStatus, latestEvent?.message);
  } catch {
    // Polling is best effort while backend is being configured.
  }
}

function orderPayload(location, street) {
  return {
    items: state.cart.map((item) => ({
      productId: item.productId,
      variant: item.variant,
      extras: item.extras,
      qty: item.qty
    })),
    delivery: {
      village: location.village,
      street
    },
    paymentMethod: state.payMethod,
    note: document.querySelector("#orderNote").value.trim()
  };
}

function renderCategories() {
  categories = ["Všetko", ...new Set(products.map((product) => product.category))];
  categoryTabs.innerHTML = categories
    .map(
      (category) =>
        `<button type="button" class="${category === state.activeCategory ? "active" : ""}" data-category="${category}">${category}</button>`
    )
    .join("");
}

async function loadRemoteMenu() {
  try {
    const response = await fetch("/api/menu");
    if (!response.ok) return;
    const data = await response.json();
    if (!data.configured || !Array.isArray(data.products) || !data.products.length) return;
    products = data.products.map((product) => ({
      ...product,
      variants: product.variants?.length ? product.variants : [{ name: "Štandard", price: 0 }],
      extras: product.extras || []
    }));
    renderDeliveryLocations();
    renderCategories();
    renderMenu();
  } catch {
    // Local static menu remains available before backend configuration.
  }
}

function filteredProducts() {
  return products.filter((product) => {
    const matchesCategory = state.activeCategory === "Všetko" || product.category === state.activeCategory;
    const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return matchesCategory && text.includes(state.search.toLowerCase());
  });
}

function renderMenu() {
  const visible = filteredProducts();
  const grouped = visible.reduce((map, product) => {
    map[product.category] ||= [];
    map[product.category].push(product);
    return map;
  }, {});

  menuList.innerHTML = Object.entries(grouped)
    .map(
      ([category, items]) => `
        <h2 class="category-title">${category}</h2>
        ${items
          .map(
            (product) => `
              <button class="product-row" type="button" data-product="${product.id}">
                <span>
                  <h3>${product.name}</h3>
                  <p>${product.description}</p>
                  <span class="price-line">
                    <strong>${formatPrice(product.price)}</strong>
                    ${product.popular ? '<span class="popular">Obľúbené</span>' : ""}
                  </span>
                </span>
                <span class="product-thumb" aria-hidden="true">${product.icon}</span>
              </button>
            `
          )
          .join("")}
      `
    )
    .join("");

  if (!visible.length) {
    menuList.innerHTML = '<p class="notice">Nenašli sa žiadne položky.</p>';
  }
}

function openProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  state.currentProduct = product;
  state.currentVariant = 0;
  state.currentExtras = new Set();
  state.currentQty = 1;

  document.querySelector("#sheetImage").textContent = product.icon;
  document.querySelector("#sheetTitle").textContent = product.name;
  document.querySelector("#sheetDescription").textContent = product.description;
  document.querySelector("#sheetQty").textContent = state.currentQty;
  renderProductOptions();
  productSheet.showModal();
}

function renderProductOptions() {
  const product = state.currentProduct;
  const variantGroup = document.querySelector("#variantGroup");
  const extrasGroup = document.querySelector("#extrasGroup");

  variantGroup.innerHTML = `
    <h3>Veľkosť alebo typ</h3>
    ${product.variants
      .map(
        (variant, index) => `
          <label class="option">
            <input type="radio" name="variant" value="${index}" ${index === state.currentVariant ? "checked" : ""} />
            <span>${variant.name}</span>
            <strong>${variant.price ? `+${formatPrice(variant.price)}` : "v cene"}</strong>
          </label>
        `
      )
      .join("")}
  `;

  extrasGroup.innerHTML = product.extras.length
    ? `
      <h3>Doplnky</h3>
      ${product.extras
        .map(
          (extra) => `
            <label class="option">
              <input type="checkbox" value="${extra.name}" ${state.currentExtras.has(extra.name) ? "checked" : ""} />
              <span>${extra.name}</span>
              <strong>+${formatPrice(extra.price)}</strong>
            </label>
          `
        )
        .join("")}
    `
    : "";

  updateAddButton();
}

function currentProductPrice() {
  const product = state.currentProduct;
  const variant = product.variants[state.currentVariant];
  const extrasTotal = selectedExtras().reduce((sum, extra) => sum + extra.price, 0);
  return (product.price + variant.price + extrasTotal) * state.currentQty;
}

function updateAddButton() {
  document.querySelector("#addToCartButton").textContent = `Pridať za ${formatPrice(currentProductPrice())}`;
}

function addCurrentProductToCart() {
  const product = state.currentProduct;
  const variant = product.variants[state.currentVariant];
  const extras = selectedExtras();
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);
  state.cart.push({
    id: uniqueId(),
    productId: product.id,
    name: product.name,
    variant: variant.name,
    extras: extras.map((extra) => extra.name),
    qty: state.currentQty,
    unitPrice: product.price + variant.price + extrasTotal
  });
  productSheet.close();
  renderCart();
}

function cartSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

function renderCart() {
  const subtotal = cartSubtotal();
  const location = selectedDeliveryLocation();
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const underMinimum = subtotal > 0 && subtotal < location.minimum;
  document.querySelector("#cartCount").textContent = totalQty;
  document.querySelector("#cartTotal").textContent = formatPrice(subtotal + location.fee);
  cartBar.hidden = totalQty === 0;

  const cartItems = document.querySelector("#cartItems");
  cartItems.innerHTML = state.cart.length
    ? state.cart
        .map(
          (item) => `
            <div class="cart-item">
              <strong>${item.qty}×</strong>
              <span>
                <h3>${item.name}</h3>
                <p>${[item.variant, ...item.extras].filter(Boolean).join(", ")}</p>
              </span>
              <strong>${formatPrice(item.unitPrice * item.qty)}</strong>
            </div>
          `
        )
        .join("")
    : "<p>Košík je prázdny.</p>";

  document.querySelector("#subtotalText").textContent = formatPrice(subtotal);
  document.querySelector("#deliveryText").textContent = formatPrice(location.fee);
  document.querySelector("#grandTotalText").textContent = formatPrice(subtotal + location.fee);
  document.querySelector("#addressButton strong").textContent = location.village;

  if (location.minimum) {
    deliveryRule.textContent = underMinimum
      ? `Objednávky mimo Hlohovca prijímame od ${formatPrice(location.minimum)}. Chýba ešte ${formatPrice(location.minimum - subtotal)}.`
      : `Rozvoz do obce ${location.village}: ${formatPrice(location.fee)}. Minimálna objednávka mimo Hlohovca je ${formatPrice(location.minimum)}.`;
  } else {
    deliveryRule.textContent = "Rozvoz v rámci Hlohovca je bez poplatku.";
  }

  deliveryRule.classList.toggle("warning", underMinimum);
  checkoutButton.disabled = totalQty === 0 || underMinimum;
}

function checkout() {
  if (!state.cart.length) return;
  const location = selectedDeliveryLocation();
  const subtotal = cartSubtotal();
  const street = deliveryStreet.value.trim();
  if (subtotal < location.minimum) {
    renderCart();
    return;
  }
  if (!deliveryStreet.checkValidity()) {
    deliveryStreet.reportValidity();
    return;
  }
  checkoutButton.disabled = true;
  checkoutButton.textContent = "Odosielam...";
  fetch("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(orderPayload(location, street))
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Objednávku sa nepodarilo odoslať.");
      state.lastOrder = data.order;
      renderOrderStatus(data.order.status);
      document.querySelector("#confirmText").textContent = `Objednávka za ${formatPrice(data.order.total)} bola prijatá. Doručenie: ${street}, ${location.village}.`;
      setInterval(pollOrderStatus, 12000);
    })
    .catch((error) => {
      state.lastOrder = { id: uniqueId(), token: "local", status: "new" };
      renderOrderStatus("new", "Backend ešte nie je nakonfigurovaný, objednávka sa zobrazuje lokálne.");
      document.querySelector("#confirmText").textContent = `${error.message} Lokálny náhľad objednávky za ${formatPrice(subtotal + location.fee)}: ${street}, ${location.village}.`;
    })
    .finally(() => {
      state.cart = [];
      renderCart();
      cartSheet.close();
      document.querySelector("#confirmDialog").showModal();
      checkoutButton.textContent = "Objednat";
    });
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});

menuList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-product]");
  if (button) openProduct(button.dataset.product);
});

searchButton.addEventListener("click", () => {
  searchPanel.hidden = !searchPanel.hidden;
  if (!searchPanel.hidden) searchInput.focus();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderMenu();
});

document.querySelector("#variantGroup").addEventListener("change", (event) => {
  if (event.target.name === "variant") {
    state.currentVariant = Number(event.target.value);
    updateAddButton();
  }
});

document.querySelector("#extrasGroup").addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    event.target.checked ? state.currentExtras.add(event.target.value) : state.currentExtras.delete(event.target.value);
    updateAddButton();
  }
});

document.querySelector("#increaseQty").addEventListener("click", () => {
  state.currentQty += 1;
  document.querySelector("#sheetQty").textContent = state.currentQty;
  updateAddButton();
});

document.querySelector("#decreaseQty").addEventListener("click", () => {
  state.currentQty = Math.max(1, state.currentQty - 1);
  document.querySelector("#sheetQty").textContent = state.currentQty;
  updateAddButton();
});

document.querySelector("#addToCartButton").addEventListener("click", addCurrentProductToCart);
cartBar.addEventListener("click", () => cartSheet.showModal());
checkoutButton.addEventListener("click", checkout);
document.querySelector("#closeConfirm").addEventListener("click", () => document.querySelector("#confirmDialog").close());
document.querySelector("#backButton").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
document.querySelector("#addressButton").addEventListener("click", () => cartSheet.showModal());

deliveryVillage.addEventListener("change", (event) => {
  state.deliveryVillage = event.target.value;
  renderCart();
});

enableNotifications.addEventListener("click", async () => {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;
  playStatusSound();
  if (!state.lastOrder?.id || !state.lastOrder?.token) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: state.lastOrder.id, subscription })
      });
    }
  } catch {
    // Push subscription requires VAPID configuration before deployment.
  }
});

document.querySelectorAll(".pay-method").forEach((button) => {
  button.addEventListener("click", () => {
    state.payMethod = button.dataset.pay;
    document.querySelectorAll(".pay-method").forEach((item) => item.classList.toggle("active", item === button));
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

renderDeliveryLocations();
renderCategories();
renderMenu();
renderCart();
loadRemoteMenu();
