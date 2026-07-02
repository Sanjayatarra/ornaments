(function () {
  const API_BASE = "http://127.0.0.1:8000/api";
  const TOKEN_KEY = "pj_token";
  const USER_KEY = "pj_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.setItem("flag_val", "false");
  }

  function syncLegacyUserStorage(user) {
    const fullName = (user && user.name) || "";
    const parts = fullName.split(" ");
    const firstName = parts[0] || "USER";
    const lastName = parts.slice(1).join(" ");

    localStorage.setItem(
      "userDataBase",
      JSON.stringify([
        {
          F_name: firstName,
          L_name: lastName,
          email: (user && user.email) || "",
          pass: "",
        },
      ])
    );
    localStorage.setItem("flag_val", "true");
  }

  async function request(path, options) {
    const opts = options || {};
    const headers = opts.headers || {};
    const isAuth = !!opts.auth;
    const body = opts.body;

    headers.Accept = "application/json";
    if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
    }
    if (isAuth) {
      const token = getToken();
      if (!token) throw new Error("Please login first.");
      headers.Authorization = "Bearer " + token;
    }

    // Ensure path has a trailing slash for Django REST Framework compatibility
    let cleanPath = path;
    const qIndex = cleanPath.indexOf("?");
    if (qIndex >= 0) {
      const basePath = cleanPath.substring(0, qIndex);
      const query = cleanPath.substring(qIndex);
      if (!basePath.endsWith("/")) {
        cleanPath = basePath + "/" + query;
      }
    } else {
      if (!cleanPath.endsWith("/")) {
        cleanPath = cleanPath + "/";
      }
    }

    const res = await fetch(API_BASE + cleanPath, {
      method: opts.method || "GET",
      headers: headers,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    });

    let payload = null;
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text);
        // Automatically unpack paginated DRF responses (e.g. {results: [...]})
        if (payload && typeof payload === "object" && Array.isArray(payload.results)) {
          payload = payload.results;
        }
      } catch (e) {
        payload = text;
      }
    }

    if (!res.ok) {
      const detail = (payload && payload.detail) || "Request failed";
      if (res.status === 401) {
        clearAuth();
      }
      throw new Error(detail);
    }

    return payload;
  }

  function mapCategoryToLegacyType(category, name) {
    const value = (String(category || "") + " " + String(name || "")).toLowerCase();
    if (value.indexOf("jhumka") >= 0) return "Jhumka";
    if (value.indexOf("drop") >= 0 || value.indexOf("dangl") >= 0 || value.indexOf("chand") >= 0) return "Drops";
    if (value.indexOf("hoop") >= 0 || value.indexOf("bali") >= 0) return "Hoops";
    if (value.indexOf("stud") >= 0 || value.indexOf("ear") >= 0) return "Studs";
    return "Jhumka";
  }

  function mapProductToLegacy(product) {
    const images = Array.isArray(product.images) && product.images.length
      ? product.images
      : ["https://via.placeholder.com/320?text=Jewellery"];
    const price = Number(product.price || 0);
    return {
      id: product.id,
      slug: product.slug,
      Title: product.name || "Jewellery",
      Description: product.description || "",
      Type: mapCategoryToLegacyType(product.category, product.name),
      Weight: (product.weight ? String(product.weight) : "0") + "g",
      Price: Math.round(price),
      DiscountPrice: Math.round(price),
      Img: images,
      Brand: "Priyanka Jewellers",
      Category: product.category || "",
      Material: product.material || "",
      Stock: Number(product.stock || 0),
      Gender: product.gender_name || "",
      tags: product.tags || [],
      featured: product.featured || false,
    };
  }

  async function fetchLegacyProducts() {
    const products = await request("/products");
    const mapped = (products || []).map(mapProductToLegacy);
    localStorage.setItem("database", JSON.stringify(mapped));
    return mapped;
  }

  async function login(email, password) {
    const payload = await request("/auth/login", {
      method: "POST",
      body: { email: email, password: password },
    });
    setToken(payload.access_token);
    const user = {
      name: payload.name || "",
      email: payload.email || email,
      role: payload.role || "customer",
    };
    setUser(user);
    syncLegacyUserStorage(user);
    return payload;
  }

  async function register(name, email, password) {
    return request("/auth/register", {
      method: "POST",
      body: { name: name, email: email, password: password },
    });
  }

  async function getCart() {
    return request("/cart", { auth: true });
  }

  async function addToCart(productId, quantity) {
    return request("/cart", {
      method: "POST",
      auth: true,
      body: {
        product_id: productId,
        quantity: Number(quantity || 1),
      },
    });
  }

  async function updateCartItem(itemId, quantity) {
    return request("/cart/" + itemId, {
      method: "PUT",
      auth: true,
      body: { quantity: Number(quantity || 1) },
    });
  }

  async function deleteCartItem(itemId) {
    return request("/cart/" + itemId, {
      method: "DELETE",
      auth: true,
    });
  }

  async function createOrder(payload) {
    return request("/orders", {
      method: "POST",
      auth: true,
      body: payload,
    });
  }

  async function syncLegacyCartFromBackend() {
    try {
      const cartItems = await getCart();
      const mapped = (cartItems || []).map(function (item) {
        const p = item.product || {};
        const price = Number(p.price || 0);
        return {
          item_id: item.id,
          product_id: p.id,
          Title: p.name || "Jewellery",
          Description: p.description || "",
          Type: mapCategoryToLegacyType(p.category, p.name),
          Weight: (p.weight ? String(p.weight) : "0") + "g",
          Price: Math.round(price),
          DiscountPrice: Math.round(price),
          Img: Array.isArray(p.images) && p.images.length ? p.images : [""],
          Brand: "Priyanka Jewellers",
          quantity: Number(item.quantity || 1),
        };
      });
      localStorage.setItem("cart", JSON.stringify(mapped));
      return mapped;
    } catch (e) {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }
  }

  function hydrateNavbar() {
    const flag = localStorage.getItem("flag_val");
    const userLink = document.getElementById("user_l");
    const cartLink = document.getElementById("cart1");

    if (userLink) {
      if (flag === "true") {
        const users = JSON.parse(localStorage.getItem("userDataBase") || "[]");
        const first = users[0] && users[0].F_name ? users[0].F_name : "USER";
        userLink.innerText = "HI " + first + "!(LOGOUT)";
        userLink.href = "#";
        userLink.onclick = function (event) {
          event.preventDefault();
          clearAuth();
          localStorage.removeItem("cart");
          window.location.href = "index.html";
        };
      } else {
        userLink.innerText = "LOGIN";
        userLink.href = "login.html";
      }
    }

    if (cartLink) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cartLink.innerText = "CART(" + cart.length + ")";
    }
  }

  window.BackendApi = {
    getToken: getToken,
    getUser: getUser,
    clearAuth: clearAuth,
    request: request,
    login: login,
    register: register,
    fetchLegacyProducts: fetchLegacyProducts,
    syncLegacyCartFromBackend: syncLegacyCartFromBackend,
    addToCart: addToCart,
    getCart: getCart,
    updateCartItem: updateCartItem,
    deleteCartItem: deleteCartItem,
    createOrder: createOrder,
    hydrateNavbar: hydrateNavbar,
    mapProductToLegacy: mapProductToLegacy,
  };
})();
