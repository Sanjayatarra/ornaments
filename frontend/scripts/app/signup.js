import { isLoggedIn, registerUser } from "./api.js";
import { renderLayout } from "./layout.js";
import { setStatus } from "./utils.js";

async function init() {
  await renderLayout();

  if (isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("signupForm");
  const status = document.getElementById("signupStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("nameInput")?.value?.trim();
    const email = document.getElementById("emailInput")?.value?.trim();
    const password = document.getElementById("passwordInput")?.value || "";
    const confirmPassword = document.getElementById("confirmPasswordInput")?.value || "";

    if (password.length < 6) {
      setStatus(status, "Password must be at least 6 characters.", "text-danger");
      return;
    }

    if (password !== confirmPassword) {
      setStatus(status, "Passwords do not match.", "text-danger");
      return;
    }

    setStatus(status, "Creating account...", "text-secondary");
    try {
      await registerUser({ name, email, password });
      setStatus(status, "Account created. Redirecting to login...", "text-success");
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      setStatus(status, error.message, "text-danger");
    }
  });
}

init();
