/* ===========================================================
   MECOSO HANDCRAFTED — Product catalog & cart engine
   =========================================================== */

const DEFAULT_PRODUCTS = [
  {
    id: "bag1",
    name: "The Third Mainland",
    category: "snake",
    categoryLabel: "Snake Skin",
    price: 100000,
    img: "assets/bag1.jpeg",
    desc: "A hand-painted Lagos waterfront skyline on richly embossed leather, finished with a sculpted top handle."
  },
  {
    id: "bag2",
    name: "The Adaeze",
    category: "snake",
    categoryLabel: "Snake Skin",
    price: 100000,
    img: "assets/bag2.jpeg",
    desc: "A portrait in mint and gold — hand-painted blossoms meet a regal profile on soft embossed leather."
  },
  {
    id: "bag3",
    name: "The Amara",
    category: "crocodile",
    categoryLabel: "Crocodile Skin",
    price: 100000,
    img: "assets/bag3.jpeg",
    desc: "A bold leopard motif in garnet and jet, finished with brushed gold hardware and a sculpted handle."
  },
  {
    id: "bag4",
    name: "The Aureus",
    category: "crocodile",
    categoryLabel: "Crocodile Skin",
    price: 100000,
    img: "assets/bag4.jpeg",
    desc: "Sun-warmed leather hand-embossed with roses, radiant in antique gold."
  },
  {
    id: "bag5",
    name: "The Ifeoma",
    category: "ostrich",
    categoryLabel: "Ostrich Skin",
    price: 100000,
    img: "assets/bag5.jpeg",
    desc: "Hand-painted peonies bloom across richly textured leather, carried on a fine gold chain."
  },
  {
    id: "bag6",
    name: "The Kaleidoscope",
    category: "ostrich",
    categoryLabel: "Ostrich Skin",
    price: 100000,
    img: "assets/bag6.jpeg",
    desc: "A mosaic of exotic textures and jewel tones, finished with a two-tone sculpted handle."
  }
];

const DEFAULT_CATEGORIES = [
  { value: "snake", label: "Snake Skin" },
  { value: "crocodile", label: "Crocodile Skin" },
  { value: "ostrich", label: "Ostrich Skin" }
];

/* Catalog now lives in a shared Netlify Function backed by Netlify
   Blobs (see /netlify/functions/products.js), so edits made in the
   Mecoso Editor are visible to every visitor — not just the browser
   that made them. These defaults are only a fallback for the rare
   case the function can't be reached (e.g. offline, first deploy
   before the function exists). */
const CATALOG_API = "/.netlify/functions/products";

let PRODUCTS = DEFAULT_PRODUCTS.slice();
let CATEGORIES = DEFAULT_CATEGORIES.slice();

async function initCatalog() {
  try {
    const res = await fetch(CATALOG_API, { cache: "no-store" });
    if (!res.ok) throw new Error("Bad response from catalog API");
    const data = await res.json();
    if (Array.isArray(data.products) && data.products.length) PRODUCTS = data.products;
    if (Array.isArray(data.categories) && data.categories.length) CATEGORIES = data.categories;
  } catch (e) {
    console.warn("Mecoso: using built-in default catalog (live catalog unreachable):", e);
  }
}

// Kicks off immediately when this script loads. Pages await this
// promise before rendering anything that depends on PRODUCTS/CATEGORIES.
const catalogReady = initCatalog();

const CART_KEY = "mecoso_cart";
const ORDER_KEY = "mecoso_pending_order";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge(true);
}

function changeQty(id, delta) {
  const cart = getCart();
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart(cart);
  if (typeof renderCart === "function") renderCart();
}

function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
  if (typeof renderCart === "function") renderCart();
}

function cartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  const cart = getCart();
  let total = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const p = PRODUCTS.find(p => p.id === id);
    if (p) total += p.price * qty;
  });
  return total;
}

function formatNaira(n) {
  return "₦" + n.toLocaleString("en-NG");
}

function updateCartBadge(animate) {
  const c = cartCount();

  document.querySelectorAll(".menu-badge").forEach(el => {
    el.textContent = c;
    el.classList.toggle("show", c > 0);
    if (animate && c > 0) {
      el.classList.remove("pop");
      void el.offsetWidth; // restart animation
      el.classList.add("pop");
    }
  });

  document.querySelectorAll(".drawer-cart-count").forEach(el => {
    el.textContent = c > 0 ? c : "";
    el.style.display = c > 0 ? "inline-flex" : "none";
  });
}

/* ---------- Shared nav drawer wiring ---------- */
function initNav() {
  const burger = document.querySelector(".hamburger");
  const drawer = document.querySelector(".nav-drawer");
  const scrim = document.querySelector(".scrim");
  if (!burger || !drawer) return;

  const toggle = () => {
    burger.classList.toggle("open");
    drawer.classList.toggle("open");
    scrim.classList.toggle("open");
  };
  burger.addEventListener("click", toggle);
  scrim.addEventListener("click", toggle);
  updateCartBadge();
}

document.addEventListener("DOMContentLoaded", initNav);
