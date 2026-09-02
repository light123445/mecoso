/* ===========================================================
   MECOSO EDITOR — shared data store
   Talks to /netlify/functions/products.js, which reads/writes a
   shared catalog via Netlify Blobs. This means every visitor to
   the storefront sees the same catalog — not just the browser
   that made the edit.
=========================================================== */

const CATALOG_API = "/.netlify/functions/products";

// Must match the EDITOR_API_KEY environment variable set on the
// Netlify function (or its fallback default if you haven't set one).
// See mecoso-editor/README.md for how to change this to something
// more secure.
const EDITOR_API_KEY = "mecoso-editor-4321";

let cachedProducts = [];
let cachedCategories = [];

async function fetchCatalog() {
  const res = await fetch(CATALOG_API, { cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't load the catalog from the server.");
  const data = await res.json();
  cachedProducts = Array.isArray(data.products) ? data.products : [];
  cachedCategories = Array.isArray(data.categories) ? data.categories : [];
  return { products: cachedProducts, categories: cachedCategories };
}

// Synchronous accessors reading the already-fetched cache. Every page
// must `await fetchCatalog()` once before relying on these.
function getProducts() {
  return cachedProducts;
}
function getCategories() {
  return cachedCategories;
}

async function apiMutate(action, payload) {
  let res;
  try {
    res = await fetch(CATALOG_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, secret: EDITOR_API_KEY, payload })
    });
  } catch (e) {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Unexpected response from the server.");
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Something went wrong saving that change.");
  }
  cachedProducts = data.products;
  cachedCategories = data.categories;
  return data;
}

async function addProduct(product) {
  return apiMutate("addProduct", product);
}
async function updateProduct(id, changes) {
  return apiMutate("updateProduct", { id, changes });
}
async function deleteProduct(id) {
  return apiMutate("deleteProduct", { id });
}
async function addCategory(label) {
  const data = await apiMutate("addCategory", { label });
  return data.categories.find(c => c.label === label.trim()) || null;
}

/**
 * Resize + compress an uploaded image before sending it, so a single
 * large phone photo doesn't bloat the stored catalog or freeze a
 * mobile browser reading it.
 * Returns a Promise<dataURL>.
 */
function readAndCompressImage(file, maxDim = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("That doesn't look like an image file."));
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error("That photo is too large (over 25MB). Please choose a smaller one."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => URL.revokeObjectURL(objectUrl);

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
      cleanup();
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        reject(new Error("Couldn't process that image. Please try a different photo."));
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error("Couldn't load that image. Please try a different photo."));
    };

    img.src = objectUrl;
  });
}

function formatNaira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}
