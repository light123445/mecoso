// netlify/functions/products.js
// Shared catalog storage for Mecoso Handcrafted, backed by Netlify Blobs.
// The storefront reads from this (GET) and the editor writes to it (POST),
// so every visitor sees the same, always-up-to-date catalog — no more
// per-browser local storage.

import { getStore } from "@netlify/blobs";

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

// This is the shared secret the editor must send to make changes.
// For real security, set an EDITOR_API_KEY environment variable in
// Netlify (Site configuration > Environment variables) and update the
// matching value in mecoso-editor/js/store.js to the same string —
// otherwise this fallback default is used, which is only as secure as
// anyone reading the source code.
const SECRET = process.env.EDITOR_API_KEY || "mecoso-editor-4321";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

function genId() {
  return "bag_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function slugify(label) {
  return String(label).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function loadData(store) {
  const data = await store.get("catalog", { type: "json" });
  if (data && Array.isArray(data.products) && Array.isArray(data.categories)) {
    return data;
  }
  const seed = { products: DEFAULT_PRODUCTS, categories: DEFAULT_CATEGORIES };
  await store.setJSON("catalog", seed);
  return seed;
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const store = getStore("mecoso-catalog");

  if (req.method === "GET") {
    const data = await loadData(store);
    return json(data, 200);
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return json({ ok: false, error: "Invalid request body." }, 400);
    }

    const { action, secret, payload } = body || {};

    if (secret !== SECRET) {
      return json({ ok: false, error: "Unauthorized." }, 401);
    }

    const data = await loadData(store);

    try {
      if (action === "addProduct") {
        if (!payload || !payload.name || !payload.img || !payload.desc || !payload.price || !payload.category) {
          throw new Error("Missing required bag fields.");
        }
        const product = {
          id: genId(),
          name: payload.name,
          category: payload.category,
          categoryLabel: payload.categoryLabel || payload.category,
          price: Number(payload.price),
          img: payload.img,
          desc: payload.desc
        };
        data.products.push(product);
      } else if (action === "updateProduct") {
        const idx = data.products.findIndex(p => p.id === payload.id);
        if (idx === -1) throw new Error("That bag no longer exists.");
        data.products[idx] = { ...data.products[idx], ...payload.changes };
      } else if (action === "deleteProduct") {
        const before = data.products.length;
        data.products = data.products.filter(p => p.id !== payload.id);
        if (data.products.length === before) throw new Error("That bag no longer exists.");
      } else if (action === "addCategory") {
        const value = slugify(payload && payload.label);
        if (!value) throw new Error("Please enter a catalog name.");
        if (data.categories.some(c => c.value === value)) {
          throw new Error("That catalog already exists.");
        }
        data.categories.push({ value, label: String(payload.label).trim() });
      } else {
        throw new Error("Unknown action.");
      }
    } catch (err) {
      return json({ ok: false, error: err.message }, 400);
    }

    await store.setJSON("catalog", data);
    return json({ ok: true, products: data.products, categories: data.categories }, 200);
  }

  return json({ ok: false, error: "Method not allowed." }, 405);
};