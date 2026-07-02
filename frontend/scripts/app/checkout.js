import { getCart, isLoggedIn, validateCoupon } from "./api.js";
import { renderLayout } from "./layout.js";
import { formatInr, setStatus } from "./utils.js";

const STORAGE_KEYS = {
  pendingOrder: "pj_pending_order",
  checkoutSnapshot: "pj_checkout_snapshot",
};

let cartItems = [];
let appliedCoupon = null;

function cartSubtotal(items) {
  return items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.product?.price || 0), 0);
}

function calcDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  if (coupon.discount_type === "percentage") {
    return subtotal * (Number(coupon.discount_value || 0) / 100);
  }
  if (coupon.discount_type === "fixed") {
    return Math.min(subtotal, Number(coupon.discount_value || 0));
  }
  return 0;
}

function renderCheckoutSummary() {
  const mount = document.getElementById("checkoutSummary");
  if (!mount) return;

  const subtotal = cartSubtotal(cartItems);
  const discount = calcDiscount(subtotal, appliedCoupon);
  const total = Math.max(subtotal - discount, 0);

  const itemsMarkup = cartItems.length
    ? cartItems
        .map(
          (item) => `
            <div class="d-flex justify-content-between small mb-2">
              <span>${item.product?.name || "Product"} x ${item.quantity}</span>
              <span>${formatInr(item.quantity * Number(item.product?.price || 0))}</span>
            </div>
          `
        )
        .join("")
    : `<p class="text-muted mb-0">No items in cart.</p>`;

  mount.innerHTML = `
    <h5 class="mb-3">Order Summary</h5>
    ${itemsMarkup}
    <hr>
    <div class="d-flex justify-content-between mb-1"><span class="muted">Subtotal</span><span>${formatInr(subtotal)}</span></div>
    <div class="d-flex justify-content-between mb-1"><span class="muted">Discount</span><span>${discount ? "-" + formatInr(discount) : formatInr(0)}</span></div>
    <div class="d-flex justify-content-between fw-semibold"><span>Total</span><span>${formatInr(total)}</span></div>
  `;
}

async function loadCheckout() {
  const status = document.getElementById("checkoutStatus");
  if (!status) return;

  if (!isLoggedIn()) {
    setStatus(status, "Please login to continue checkout.", "text-danger");
    document.getElementById("checkoutForm")?.classList.add("d-none");
    return;
  }

  setStatus(status, "Loading cart...", "text-secondary");
  try {
    cartItems = await getCart();
    if (!cartItems.length) {
      setStatus(status, "Your cart is empty. Add products first.", "text-danger");
      document.getElementById("checkoutForm")?.classList.add("d-none");
      return;
    }
    renderCheckoutSummary();
    setStatus(status, "", "text-muted");
  } catch (error) {
    setStatus(status, error.message, "text-danger");
  }
}

function readAddressFromForm() {
  return {
    full_name: document.getElementById("fullNameInput")?.value?.trim(),
    phone: document.getElementById("phoneInput")?.value?.trim(),
    line1: document.getElementById("line1Input")?.value?.trim(),
    line2: document.getElementById("line2Input")?.value?.trim(),
    city: document.getElementById("cityInput")?.value?.trim(),
    state: document.getElementById("stateInput")?.value?.trim(),
    pincode: document.getElementById("pincodeInput")?.value?.trim(),
  };
}

function initCouponEvents() {
  const button = document.getElementById("applyCouponBtn");
  const codeInput = document.getElementById("couponInput");
  const status = document.getElementById("couponStatus");

  button?.addEventListener("click", async () => {
    const code = codeInput?.value?.trim();
    if (!code) {
      setStatus(status, "Enter a coupon code.", "text-danger");
      return;
    }

    setStatus(status, "Checking coupon...", "text-secondary");
    try {
      const coupon = await validateCoupon(code);
      appliedCoupon = coupon;
      renderCheckoutSummary();
      setStatus(status, `Coupon ${coupon.code} applied.`, "text-success");
    } catch (error) {
      appliedCoupon = null;
      renderCheckoutSummary();
      setStatus(status, error.message, "text-danger");
    }
  });
}

function initSubmit() {
  const form = document.getElementById("checkoutForm");
  const status = document.getElementById("checkoutStatus");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!cartItems.length) {
      setStatus(status, "Your cart is empty.", "text-danger");
      return;
    }

    const shipping_address = readAddressFromForm();
    const payment_method = document.getElementById("paymentMethodInput")?.value;

    const requiredFields = ["full_name", "phone", "line1", "city", "state", "pincode"];
    const missing = requiredFields.some((field) => !shipping_address[field]);
    if (missing) {
      setStatus(status, "Please fill all required shipping fields.", "text-danger");
      return;
    }

    const subtotal = cartSubtotal(cartItems);
    const discount = calcDiscount(subtotal, appliedCoupon);
    const total = Math.max(subtotal - discount, 0);

    const payload = {
      payment_method,
      shipping_address,
      discount_code: appliedCoupon?.code || "",
    };

    localStorage.setItem(STORAGE_KEYS.pendingOrder, JSON.stringify(payload));
    localStorage.setItem(
      STORAGE_KEYS.checkoutSnapshot,
      JSON.stringify({
        items: cartItems,
        subtotal,
        discount,
        total,
        payment_method,
      })
    );

    window.location.href = "payment.html";
  });
}

async function init() {
  await renderLayout({ active: "checkout" });
  await loadCheckout();
  initCouponEvents();
  initSubmit();
}

init();
