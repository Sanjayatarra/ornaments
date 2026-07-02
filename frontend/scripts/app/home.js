import { addToCart, getProducts, isLoggedIn } from "./api.js";
import { renderLayout, refreshCartCount } from "./layout.js";
import { formatInr, setStatus } from "./utils.js";

function productCard(product) {
  const img = product.images?.[0] || "https://via.placeholder.com/600x600?text=Jewellery";
  return `
    <div class="col-sm-6 col-lg-3">
      <div class="card product-card">
        <img src="${img}" class="product-img card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="pill">${product.category || "Jewellery"}</span>
            <small class="muted">${(product.material || "").replace("Karat", "K")}</small>
          </div>
          <h6 class="card-title">${product.name}</h6>
          <p class="price mb-3">${formatInr(product.price)}</p>
          <div class="mt-auto d-grid gap-2">
            <a href="productsDetail.html?slug=${encodeURIComponent(product.slug)}" class="btn btn-sm pj-btn-outline">View</a>
            <button class="btn btn-sm pj-btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadFeatured() {
  const list = document.getElementById("featuredProducts");
  const status = document.getElementById("homeStatus");
  if (!list || !status) return;

  setStatus(status, "Loading products...", "text-secondary");
  try {
    const products = await getProducts({ sort_by: "created_at_desc" });
    const featured = products.slice(0, 8);
    if (!featured.length) {
      list.innerHTML = "";
      setStatus(status, "No products found in the catalog yet.", "text-muted");
      return;
    }

    list.innerHTML = featured.map(productCard).join("");
    setStatus(status, "", "text-muted");

    list.querySelectorAll(".add-to-cart-btn").forEach((button) => {
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
  await renderLayout({ active: "home" });
  await loadFeatured();
}

init();
