import {
  addToCart,
  getProductBySlug,
  getProductRecommendations,
  isLoggedIn,
} from "./api.js";
import { renderLayout, refreshCartCount } from "./layout.js";
import { formatInr, getQueryParam, setStatus } from "./utils.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProduct(product) {
  const mount = document.getElementById("productDetailMount");
  if (!mount) return;

  const images = product.images?.length
    ? product.images
    : ["https://via.placeholder.com/900x900?text=Jewellery"];
  const mainImage = images[0];
  const thumbs = images
    .map(
      (img, index) => `
        <button class="btn btn-sm btn-light border thumb-btn ${index === 0 ? "border-dark" : ""}" data-img="${escapeHtml(img)}" type="button">
          <img src="${escapeHtml(img)}" alt="thumb-${index}" style="height:56px;width:56px;object-fit:cover;">
        </button>
      `
    )
    .join("");

  mount.innerHTML = `
    <div class="col-lg-6">
      <div class="summary-card p-3">
        <img id="mainProductImage" src="${escapeHtml(mainImage)}" class="w-100 rounded" style="aspect-ratio:1/1;object-fit:cover;" alt="${escapeHtml(product.name)}">
        <div class="d-flex gap-2 flex-wrap mt-3">${thumbs}</div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="summary-card p-4 h-100">
        <span class="pill">${escapeHtml(product.category || "Jewellery")}</span>
        <h2 class="h4 mt-3">${escapeHtml(product.name)}</h2>
        <p class="price h5">${formatInr(product.price)}</p>
        <p class="muted">${escapeHtml(product.description || "No description available.")}</p>
        <div class="row g-2 mb-3">
          <div class="col-6"><small class="muted">Material</small><div>${escapeHtml(product.material || "-")}</div></div>
          <div class="col-6"><small class="muted">Gemstone</small><div>${escapeHtml(product.gemstone || "None")}</div></div>
          <div class="col-6"><small class="muted">Purity</small><div>${escapeHtml(product.purity || "-")}</div></div>
          <div class="col-6"><small class="muted">Stock</small><div>${product.stock ?? 0}</div></div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <label for="qtyInput" class="form-label mb-0">Qty</label>
          <input id="qtyInput" type="number" class="form-control" min="1" max="10" value="1" style="max-width:90px;">
          <button id="addToCartBtn" class="btn pj-btn-primary">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  const main = document.getElementById("mainProductImage");
  mount.querySelectorAll(".thumb-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const nextImg = event.currentTarget.dataset.img;
      if (nextImg && main) main.src = nextImg;
      mount.querySelectorAll(".thumb-btn").forEach((b) => b.classList.remove("border-dark"));
      event.currentTarget.classList.add("border-dark");
    });
  });
}

function recommendationCard(item) {
  const image = item.images?.[0] || "https://via.placeholder.com/600x600?text=Jewellery";
  return `
    <div class="col-sm-6 col-lg-3">
      <a href="productsDetail.html?slug=${encodeURIComponent(item.slug)}" class="text-decoration-none text-dark">
        <div class="card product-card h-100">
          <img src="${escapeHtml(image)}" class="product-img card-img-top" alt="${escapeHtml(item.name)}">
          <div class="card-body">
            <h6 class="card-title">${escapeHtml(item.name)}</h6>
            <p class="price mb-0">${formatInr(item.price)}</p>
          </div>
        </div>
      </a>
    </div>
  `;
}

async function init() {
  await renderLayout({ active: "products" });

  const slug = getQueryParam("slug");
  const status = document.getElementById("detailStatus");
  if (!slug) {
    setStatus(status, "Missing product slug in URL.", "text-danger");
    return;
  }

  setStatus(status, "Loading product...", "text-secondary");
  try {
    const product = await getProductBySlug(slug);
    renderProduct(product);
    setStatus(status, "", "text-muted");

    document.getElementById("addToCartBtn")?.addEventListener("click", async () => {
      if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
      }

      const qtyInput = document.getElementById("qtyInput");
      const quantity = Math.max(1, Number(qtyInput?.value || 1));

      try {
        await addToCart({ product_id: product.id, quantity });
        await refreshCartCount();
        setStatus(status, "Added to cart.", "text-success");
      } catch (error) {
        setStatus(status, error.message, "text-danger");
      }
    });

    const recommendations = await getProductRecommendations(product.id);
    const recMount = document.getElementById("recommendationsMount");
    if (recMount) {
      recMount.innerHTML = recommendations.map(recommendationCard).join("");
    }
  } catch (error) {
    setStatus(status, error.message, "text-danger");
  }
}

init();
