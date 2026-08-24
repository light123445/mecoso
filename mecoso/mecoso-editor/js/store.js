/* ===========================================================
   MECOSO EDITOR — shared data store
   Uses the SAME localStorage keys as the storefront's js/cart.js
   so changes made here appear on the live site. Both sites must
   be served from the same domain/origin for this to work.
=========================================================== */

const DEFAULT_PRODUCTS = [
  { id: "bag1", name: "The Third Mainland", category: "snake", categoryLabel: "Snake Skin", price: 100000, img: "assets/bag1.jpeg", desc: "A hand-painted Lagos waterfront skyline on richly embossed leather, finished with a sculpted top handle." },
  { id: "bag2", name: "The Adaeze", category: "snake", categoryLabel: "Snake Skin", price: 100000, img: "assets/bag2.jpeg", desc: "A portrait in mint and gold — hand-painted blossoms meet a regal profile on soft embossed leather." },
  { id: "bag3", name: "The Amara", category: "crocodile", categoryLabel: "Crocodile Skin", price: 100000, img: "assets/bag3.jpeg", desc: "A bold leopard motif in garnet and jet, finished with brushed gold hardware and a sculpted handle." },
  { id: "bag4", name: "The Aureus", category: "crocodile", categoryLabel: "Crocodile Skin", price: 100000, img: "assets/bag4.jpeg", desc: "Sun-warmed leather hand-embossed with roses, radiant in antique gold." },
  { id: "bag5", name: "The Ifeoma", category: "ostrich", categoryLabel: "Ostrich Skin", price: 100000, img: "assets/bag5.jpeg", desc: "Hand-painted peonies bloom across richly textured leather, carried on a fine gold chain." },
  { id: "bag6", name: "The Kaleidoscope", category: "ostrich", categoryLabel: "Ostrich Skin", price: 100000, img: "assets/bag6.jpeg", desc: "A mosaic of exotic textures and jewel tones, finished with a two-tone sculpted handle." }
];

const DEFAULT_CATEGORIES = [
  { value: "snake", label: "Snake Skin" },
  { value: "crocodile", label: "Crocodile Skin" },
  { value: "ostrich", label: "Ostrich Skin" }
];

const SHARED_PRODUCTS_KEY = "mecoso_shared_products";
const SHARED_CATEGORIES_KEY = "mecoso_shared_categories";

function readList(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback.slice();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback.slice();
  } catch (e) {
    return fallback.slice();
  }
}

function getProducts() {
  return readList(SHARED_PRODUCTS_KEY, DEFAULT_PRODUCTS);
}
function saveProducts(list) {
  try {
    localStorage.setItem(SHARED_PRODUCTS_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Failed to save products:", e);
    return false;
  }
}
function getCategories() {
  return readList(SHARED_CATEGORIES_KEY, DEFAULT_CATEGORIES);
}
function saveCategories(list) {
  try {
    localStorage.setItem(SHARED_CATEGORIES_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Failed to save categories:", e);
    return false;
  }
}

function addProduct(product) {
  const list = getProducts();
  list.push(product);
  return saveProducts(list);
}
function updateProduct(id, changes) {
  const list = getProducts();
  const idx = list.findIndex(p => p.id === id);
  if (idx > -1) {
    const updated = { ...list[idx], ...changes };
    const newList = list.slice();
    newList[idx] = updated;
    return saveProducts(newList);
  }
  return false;
}
function deleteProduct(id) {
  const before = getProducts();
  const list = before.filter(p => p.id !== id);
  if (list.length === before.length) return false; // nothing matched
  return saveProducts(list);
}
function addCategory(label) {
  const list = getCategories();
  const value = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!value || list.some(c => c.value === value)) return null;
  const cat = { value, label: label.trim() };
  list.push(cat);
  const ok = saveCategories(list);
  return ok ? cat : null;
}

/**
 * Resize + compress an uploaded image before storing it, so a single
 * large photo doesn't eat up the browser's local storage quota (which
 * is what silently breaks saving/deleting once storage is full).
 * Returns a Promise<dataURL>.
 */
function readAndCompressImage(file, maxDim = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => resolve(ev.target.result); // fall back to raw data
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (e) {
          resolve(ev.target.result);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function formatNaira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

function newProductId() {
  return "bag_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
