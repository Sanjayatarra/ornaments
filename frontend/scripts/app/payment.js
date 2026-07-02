import { createOrder, isLoggedIn } from "./api.js";
import { renderLayout, refreshCartCount } from "./layout.js";
import { formatInr, setStatus } from "./utils.js";

const STORAGE_KEYS = {
  pendingOrder: "pj_pending_order",
  checkoutSnapshot: "pj_checkout_snapshot",
};

function readStorageJson(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderSnapshot(snapshot) {
  const mount = document.getElementById("paymentSummary");
  if (!mount) return;

  if (!snapshot || !snapshot.items?.length) {
    mount.innerHTML = `
      <div class="empty-state p-4 text-center">
        <p class="mb-2">No checkout session found.</p>
        <a href="checkout.html" class="btn btn-sm pj-btn-primary">Back to Checkout</a>
      </div>
    `;
    return;
  }

  const items = snapshot.items
    .map(
      (item) => `
        <div class="d-flex justify-content-between small mb-2">
          <span>${item.product?.name || "Product"} x ${item.quantity}</span>
          <span>${formatInr(item.quantity * Number(item.product?.price || 0))}</span>
        </div>
      `
    )
    .join("");

  mount.innerHTML = `
    <h5 class="mb-3">Payment Summary</h5>
    ${items}
    <hr>
    <div class="d-flex justify-content-between"><span class="muted">Subtotal</span><span>${formatInr(snapshot.subtotal || 0)}</span></div>
    <div class="d-flex justify-content-between"><span class="muted">Discount</span><span>${snapshot.discount ? "-" + formatInr(snapshot.discount) : formatInr(0)}</span></div>
    <div class="d-flex justify-content-between fw-semibold"><span>Total</span><span>${formatInr(snapshot.total || 0)}</span></div>
    <div class="mt-2 small muted">Mode: ${snapshot.payment_method}</div>
  `;
}

function renderSuccess(order) {
  const mount = document.getElementById("paymentResult");
  if (!mount) return;
  mount.innerHTML = `
    <div class="alert alert-success mt-3" role="alert">
      <h5 class="alert-heading">Order placed successfully</h5>
      <p class="mb-1">Order ID: <strong>#${order.id}</strong></p>
      <p class="mb-1">Tracking: <strong>${order.tracking_number || "Will be assigned soon"}</strong></p>
      <p class="mb-0">Total: <strong>${formatInr(order.total_amount || 0)}</strong></p>
    </div>
    <a class="btn pj-btn-primary" href="products.html">Continue Shopping</a>
  `;
}

async function init() {
  await renderLayout({ active: "checkout" });

  const status = document.getElementById("paymentStatus");
  const pendingOrder = readStorageJson(STORAGE_KEYS.pendingOrder);
  const snapshot = readStorageJson(STORAGE_KEYS.checkoutSnapshot);

  renderSnapshot(snapshot);

  if (!isLoggedIn()) {
    setStatus(status, "Please login to complete payment.", "text-danger");
    document.getElementById("placeOrderBtn")?.classList.add("d-none");
    return;
  }

  if (!pendingOrder) {
    setStatus(status, "No pending checkout data found.", "text-danger");
    document.getElementById("placeOrderBtn")?.classList.add("d-none");
    return;
  }

  setStatus(status, "", "text-muted");

  document.getElementById("placeOrderBtn")?.addEventListener("click", async () => {
    setStatus(status, "Processing payment and creating order...", "text-secondary");
    try {
      const order = await createOrder(pendingOrder);
      localStorage.removeItem(STORAGE_KEYS.pendingOrder);
      localStorage.removeItem(STORAGE_KEYS.checkoutSnapshot);
      setStatus(status, "", "text-muted");
      renderSuccess(order);
      document.getElementById("placeOrderBtn")?.classList.add("d-none");
      await refreshCartCount();
    } catch (error) {
      setStatus(status, error.message, "text-danger");
    }
  });
}

init();
