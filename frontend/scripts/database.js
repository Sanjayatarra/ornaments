// Legacy placeholder for old static database.
// Product data is now loaded from backend API via scripts/backendApi.js.
window.databaseArray = JSON.parse(localStorage.getItem("database") || "[]");
