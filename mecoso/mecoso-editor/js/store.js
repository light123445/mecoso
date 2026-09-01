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
 * large photo doesn't eat up the browser's local storage quota.
 * Returns a Promise<dataURL>.
 */
function readAndCompressImage(file, maxDim = 1400, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    const compress = (source, sourceWidth, sourceHeight) => {
      try {
        const scale = Math.min(
          1,
          maxDim / Math.max(sourceWidth, sourceHeight)
        );

        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) {
          throw new Error("Canvas is not available.");
        }

        ctx.drawImage(source, 0, 0, width, height);

        // Convert the original image to a smaller JPEG.
        let result = canvas.toDataURL("image/jpeg", quality);

        // Reduce quality further if the image is still large.
        for (
          let q = quality;
          q >= 0.42 && result.length > 650000;
          q -= 0.07
        ) {
          result = canvas.toDataURL("image/jpeg", q);
        }

        // Final size reduction if still too large.
        if (result.length > 650000) {
          const smaller = document.createElement("canvas");

          const scale2 = Math.sqrt(650000 / result.length);

          smaller.width = Math.max(
            1,
            Math.round(width * scale2)
          );

          smaller.height = Math.max(
            1,
            Math.round(height * scale2)
          );

          const ctx2 = smaller.getContext("2d", { alpha: false });

          ctx2.drawImage(
            canvas,
            0,
            0,
            smaller.width,
            smaller.height
          );

          result = smaller.toDataURL("image/jpeg", 0.62);
        }

        URL.revokeObjectURL(objectUrl);
        resolve(result);

      } catch (e) {
        URL.revokeObjectURL(objectUrl);

        reject(
          new Error(
            "Could not process this image. Please try a JPG or PNG photo."
          )
        );
      }
    };

    // Handles very large phone photos more reliably.
    if (typeof createImageBitmap === "function") {
      createImageBitmap(file)
        .then(bitmap => {
          try {
            compress(bitmap, bitmap.width, bitmap.height);
          } finally {
            if (bitmap.close) bitmap.close();
          }
        })
        .catch(() => loadWithImage());
    } else {
      loadWithImage();
    }

    function loadWithImage() {
      const img = new Image();

      img.onload = () => {
        compress(
          img,
          img.naturalWidth || img.width,
          img.naturalHeight || img.height
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);

        reject(
          new Error(
            "This image format could not be read by the browser. Try a JPG or PNG photo."
          )
        );
      };

      img.src = objectUrl;
    }
  });
}
```
