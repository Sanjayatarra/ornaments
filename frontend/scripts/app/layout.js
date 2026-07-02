import { clearSession, getCart, getUser, isLoggedIn } from "./api.js";

function navActiveClass(active, expected) {
  return active === expected ? "nav-link active" : "nav-link";
}

function navbarTemplate(active) {
  const user = getUser();
  const loggedIn = isLoggedIn();

  return `
    <nav class="navbar navbar-expand-lg pj-navbar sticky-top">
      <div class="container">
        <a class="navbar-brand pj-brand" href="index.html">PRIYANKA JEWELLERS</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="${navActiveClass(active, "home")}" href="index.html">Home</a></li>
            <li class="nav-item"><a class="${navActiveClass(active, "products")}" href="products.html">Shop</a></li>
            <li class="nav-item"><a class="${navActiveClass(active, "cart")}" href="cart.html">Cart <span class="badge text-bg-dark ms-1" id="cartCountBadge">0</span></a></li>
            <li class="nav-item"><a class="${navActiveClass(active, "checkout")}" href="checkout.html">Checkout</a></li>
          </ul>
          <div class="d-flex align-items-center gap-2">
            ${
              loggedIn
                ? `<span class="auth-badge">${user?.name || user?.email || "Signed in"}</span>
                   <button class="btn btn-sm pj-btn-outline" id="logoutBtn">Logout</button>`
                : `<a class="btn btn-sm pj-btn-outline" href="login.html">Login</a>
                   <a class="btn btn-sm pj-btn-primary" href="signup.html">Sign up</a>`
            }
          </div>
        </div>
      </div>
    </nav>
  `;
}

function footerTemplate() {
  return `
    <footer class="footer mt-5 py-4">
      <div class="container d-flex flex-column flex-md-row justify-content-between gap-2">
        <p class="mb-0 muted">Priyanka Jewellers Luxury Collection</p>
        <p class="mb-0 muted">Crafted with care in India</p>
      </div>
    </footer>
  `;
}

export async function refreshCartCount() {
  const badge = document.getElementById("cartCountBadge");
  if (!badge) return;

  if (!isLoggedIn()) {
    badge.textContent = "0";
    return;
  }

  try {
    const items = await getCart();
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = String(totalQty);
  } catch {
    badge.textContent = "0";
  }
}

export async function renderLayout({ active = "" } = {}) {
  const navMount = document.getElementById("app-nav");
  const footerMount = document.getElementById("app-footer");

  if (navMount) {
    navMount.innerHTML = navbarTemplate(active);
  }

  if (footerMount) {
    footerMount.innerHTML = footerTemplate();
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = "login.html";
    });
  }

  await refreshCartCount();
}
