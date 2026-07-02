import {
  getCart,
  isLoggedIn,
  removeCartItem,
  updateCartItem,
} from "./api.js";
import { renderLayout, refreshCartCount } from "./layout.js";
import { formatInr, setStatus } from "./utils.js";

function cartRow(item) {
  const image = item.product?.images?.[0] || "https://via.placeholder.com/300x300?text=Jewellery";
  const lineTotal = Number(item.quantity) * Number(item.product?.price || 0);
  return `
    <tr>
      <td>
        <div class="d-flex gap-2 align-items-center">
          <img src="${image}" alt="${item.product?.name || ""}" style="height:62px;width:62px;object-fit:cover;" class="rounded border">
          <div>
            <div>${item.product?.name || "Product"}</div>
            <small class="muted">${item.product?.category || ""}</small>
          </div>
        </div>
      </td>
      <td>${formatInr(item.product?.price || 0)}</td>
      <td style="max-width:120px;">
        <div class="input-group input-group-sm">
          <input class="form-control qty-input" min="1" type="number" value="${item.quantity}" data-item-id="${item.id}">
          <button class="btn btn-outline-secondary update-item-btn" data-item-id="${item.id}" type="button">Update</button>
        </div>
      </td>
      <td>${formatInr(lineTotal)}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger remove-item-btn" data-item-id="${item.id}" type="button">Remove</button>
      </td>
    </tr>
  `;
}

function totals(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.product?.price || 0), 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderTotals(items) {
  const mount = document.getElementById("cartSummary");
  if (!mount) return;
  const { subtotal, shipping, total } = totals(items);

  mount.innerHTML = `
    <h5>Order Summary</h5>
    <div class="d-flex justify-content-between"><span class="muted">Subtotal</span><span>${formatInr(subtotal)}</span></div>
    <div class="d-flex justify-content-between"><span class="muted">Shipping</span><span>${shipping ? formatInr(shipping) : "Free"}</span></div>
    <hr>
    <div class="d-flex justify-content-between fw-semibold"><span>Total</span><span>${formatInr(total)}</span></div>
    <a href="checkout.html" class="btn pj-btn-primary w-100 mt-3 ${items.length ? "" : "disabled"}">Proceed to Checkout</a>
  `;
}

async function loadCart() {
  const status = document.getElementById("cartStatus");
  const tableBody = document.getElementById("cartRows");
  const empty = document.getElementById("emptyCart");
  if (!status || !tableBody || !empty) return;

  if (!isLoggedIn()) {
    tableBody.innerHTML = "";
    empty.classList.remove("d-none");
    empty.innerHTML = `
      <p class="mb-2">Please login to view your cart.</p>
      <a class="btn btn-sm pj-btn-primary" href="login.html?next=cart.html">Login</a>
    `;
    setStatus(status, "", "text-muted");
    renderTotals([]);
    return;
  }

  setStatus(status, "Loading cart...", "text-secondary");

  try {
    const items = await getCart();
    if (!items.length) {
      tableBody.innerHTML = "";
      empty.classList.remove("d-none");
      empty.innerHTML = `<p class="mb-0">Your cart is empty.</p>`;
      setStatus(status, "", "text-muted");
      renderTotals([]);
      await refreshCartCount();
      return;
    }

    empty.classList.add("d-none");
    tableBody.innerHTML = items.map(cartRow).join("");
    renderTotals(items);
    setStatus(status, "", "text-muted");
    await refreshCartCount();

    tableBody.querySelectorAll(".update-item-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const itemId = Number(event.currentTarget.dataset.itemId);
        const qtyInput = tableBody.querySelector(`.qty-input[data-item-id="${itemId}"]`);
        const quantity = Math.max(1, Number(qtyInput?.value || 1));

        try {
          await updateCartItem(itemId, quantity);
          await loadCart();
          setStatus(status, "Cart updated.", "text-success");
        } catch (error) {
          setStatus(status, error.message, "text-danger");
        }
      });
    });

    tableBody.querySelectorAll(".remove-item-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const itemId = Number(event.currentTarget.dataset.itemId);
        try {
          await removeCartItem(itemId);
          await loadCart();
          setStatus(status, "Item removed.", "text-success");
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
  await renderLayout({ active: "cart" });
  await loadCart();
}

init();
