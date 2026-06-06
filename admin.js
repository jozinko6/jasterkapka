const pinInput = document.querySelector("#staffPin");
const productList = document.querySelector("#productList");
const inventoryList = document.querySelector("#inventoryList");
const productForm = document.querySelector("#productForm");
const ingredientForm = document.querySelector("#ingredientForm");

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

async function loadProducts() {
  productList.innerHTML = "<p>Načítavam...</p>";
  try {
    const data = await api("/api/admin/products");
    productList.innerHTML = data.products
      .map(
        (product) => `
          <div class="table-row">
            <span>
              <strong>${product.name}</strong>
              <span class="muted">${product.categories?.name || ""} • ${Number(product.price).toFixed(2)} € • ${product.is_active ? "aktívny" : "skrytý"}</span>
            </span>
            <button type="button" data-edit="${product.id}">Upraviť</button>
            <button type="button" data-toggle="${product.id}" data-active="${product.is_active}">${product.is_active ? "Skryť" : "Zapnúť"}</button>
          </div>
        `
      )
      .join("");
    productList.dataset.products = JSON.stringify(data.products);
  } catch (error) {
    productList.innerHTML = `<p>${error.message}</p>`;
  }
}

async function loadInventory() {
  inventoryList.innerHTML = "<p>Načítavam...</p>";
  try {
    const data = await api("/api/admin/inventory");
    inventoryList.innerHTML = data.ingredients
      .map(
        (item) => `
          <div class="table-row">
            <span>
              <strong>${item.name}</strong>
              <span class="muted">${Number(item.stock_qty)} ${item.unit} • minimum ${Number(item.low_stock_qty)} ${item.unit}</span>
            </span>
          </div>
        `
      )
      .join("");
  } catch (error) {
    inventoryList.innerHTML = `<p>${error.message}</p>`;
  }
}

productList.addEventListener("click", async (event) => {
  const editId = event.target.dataset.edit;
  const toggleId = event.target.dataset.toggle;
  const products = JSON.parse(productList.dataset.products || "[]");
  if (editId) {
    const product = products.find((item) => item.id === editId);
    if (!product) return;
    productForm.elements.id.value = product.id;
    productForm.elements.name.value = product.name;
    productForm.elements.description.value = product.description;
    productForm.elements.price.value = product.price;
    productForm.elements.icon.value = product.icon;
    productForm.elements.is_active.checked = product.is_active;
    productForm.elements.is_popular.checked = product.is_popular;
  }
  if (toggleId) {
    await api("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({ id: toggleId, is_active: event.target.dataset.active !== "true" })
    });
    loadProducts();
  }
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(productForm);
  await api("/api/admin/products", {
    method: "PATCH",
    body: JSON.stringify({
      id: form.get("id"),
      name: form.get("name"),
      description: form.get("description"),
      price: Number(form.get("price")),
      icon: form.get("icon"),
      is_active: form.get("is_active") === "on",
      is_popular: form.get("is_popular") === "on"
    })
  });
  productForm.reset();
  loadProducts();
});

ingredientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(ingredientForm);
  await api("/api/admin/inventory", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(form.entries()))
  });
  ingredientForm.reset();
  loadInventory();
});

document.querySelector("#loadAdmin").addEventListener("click", () => {
  loadProducts();
  loadInventory();
});
document.querySelector("#refreshProducts").addEventListener("click", loadProducts);
document.querySelector("#refreshInventory").addEventListener("click", loadInventory);
