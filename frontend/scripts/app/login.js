import { isLoggedIn, loginUser } from "./api.js";
import { renderLayout } from "./layout.js";
import { setStatus } from "./utils.js";

async function init() {
  await renderLayout();

  if (isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const status = document.getElementById("loginStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(status, "Signing in...", "text-secondary");

    const email = document.getElementById("emailInput")?.value?.trim();
    const password = document.getElementById("passwordInput")?.value;

    try {
      await loginUser({ email, password });
      setStatus(status, "Login successful. Redirecting...", "text-success");
      const nextUrl = new URLSearchParams(window.location.search).get("next");
      window.location.href = nextUrl || "index.html";
    } catch (error) {
      setStatus(status, error.message, "text-danger");
    }
  });
}

init();
