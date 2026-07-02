export function formatInr(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function setStatus(el, message, type = "muted") {
  if (!el) return;
  el.className = `status-message small ${type}`;
  el.textContent = message || "";
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function toTitleCase(value) {
  return (value || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
