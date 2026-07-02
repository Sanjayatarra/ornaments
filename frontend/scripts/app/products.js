import { addToCart, getProducts, isLoggedIn } from "./api.js";
import { renderLayout, refreshCartCount } from "./layout.js";
import { formatInr, setStatus } from "./utils.js";

function getFiltersFromUi() {
  return {
    search: document.getElementById("searchInput")?.value?.trim() || "",
    category: document.getElementById("categoryInput")?.value || "",
    material: document.getElementById("materialInput")?.value || "",
    gemstone: document.getElementById("gemstoneInput")?.value || "",
    min_price: document.getElementById("minPriceInput")?.value || "",
    max_price: document.getElementById("maxPriceInput")?.value || "",
    sort_by: document.getElementById("sortInput")?.value || "created_at_desc",
  };
}

function setFiltersToUi(filters) {
  const map = {
    searchInput: filters.search || "",
    categoryInput: filters.category || "",
    materialInput: filters.material || "",
    gemstoneInput: filters.gemstone || "",
    minPriceInput: filters.min_price || "",
    maxPriceInput: filters.max_price || "",
    sortInput: filters.sort_by || "created_at_desc",
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

function readFiltersFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("search") || "",
    category: params.get("category") || "",
    material: params.get("material") || "",
    gemstone: params.get("gemstone") || "",
    min_price: params.get("min_price") || "",
    max_price: params.get("max_price") || "",
    sort_by: params.get("sort_by") || "created_at_desc",
  };
}

function writeFiltersToQuery(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.set(key, value);
    }
  });
  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", nextUrl);
}

function productCard(product) {
  const image = product.images?.[0] || "https://via.placeholder.com/600x600?text=Jewellery";
  return `
    <div class="col-sm-6 col-xl-4">
      <div class="card product-card">
        <img src="${image}" class="product-img card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title mb-1">${product.name}</h6>
          <p class="muted small mb-2">${product.category || "Jewellery"} | ${product.material || "Metal"}</p>
          <p class="price mb-3">${formatInr(product.price)}</p>
          <div class="d-grid gap-2 mt-auto">
            <a href="productsDetail.html?slug=${encodeURIComponent(product.slug)}" class="btn btn-sm pj-btn-outline">View Details</a>
            <button class="btn btn-sm pj-btn-primary add-btn" data-product-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadProducts(filters) {
  const list = document.getElementById("productsGrid");
  const status = document.getElementById("productsStatus");
  const count = document.getElementById("resultsCount");
  if (!list || !status || !count) return;

  setStatus(status, "Loading products...", "text-secondary");
  list.innerHTML = "";

  try {
    const products = await getProducts(filters);
    count.textContent = `${products.length} items`;

    if (!products.length) {
      setStatus(status, "No products matched your filters.", "text-muted");
      return;
    }

    list.innerHTML = products.map(productCard).join("");
    setStatus(status, "", "text-muted");

    list.querySelectorAll(".add-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const productId = Number(event.currentTarget.dataset.productId);
        if (!isLoggedIn()) {
          window.location.href = "login.html";
          return;
        }
        try {
          await addToCart({ product_id: productId, quantity: 1 });
          await refreshCartCount();
          setStatus(status, "Added to cart.", "text-success");
        } catch (error) {
          setStatus(status, error.message, "text-danger");
        }
      });
    });
  } catch (error) {
    setStatus(status, error.message, "text-danger");
  }
}

async function init() {
  await renderLayout({ active: "products" });

  const initialFilters = readFiltersFromQuery();
  setFiltersToUi(initialFilters);
  await loadProducts(initialFilters);

  const form = document.getElementById("filterForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const filters = getFiltersFromUi();
    writeFiltersToQuery(filters);
    await loadProducts(filters);
  });

  document.getElementById("resetFiltersBtn")?.addEventListener("click", async () => {
    setFiltersToUi({
      search: "",
      category: "",
      material: "",
      gemstone: "",
      min_price: "",
      max_price: "",
      sort_by: "created_at_desc",
    });
    const filters = getFiltersFromUi();
    writeFiltersToQuery(filters);
    await loadProducts(filters);
  });
}

init();
