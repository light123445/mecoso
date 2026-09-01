# Mecoso Editor

A companion admin site for managing the Mecoso Handcrafted catalog —
add, edit, and delete bags and catalog categories without touching code.

## ⚠️ Important — must be hosted alongside the storefront
This editor writes to the browser's `localStorage` using the same keys
the storefront (`js/cart.js`) reads from. That only works if **both
sites are served from the same domain** (subpaths are fine, subdomains
are not — e.g. `mecoso.com/` for the shop and `mecoso.com/studio/` for
this editor works; `shop.mecoso.com` + `studio.mecoso.com` does not).

Also note: since this is a static site with no server, everything is
stored in the visitor's own browser. Changes made here are only visible
on that same browser/device — not automatically synced to every visitor
worldwide. For that, the catalog would eventually need to move to a real
database with a backend. Happy to help set that up when you're ready.

## Login
- Username: `mimi`
- Password: `4321`

Change these in `js/auth.js` (`EDITOR_USERNAME` / `EDITOR_PASSWORD`) any
time — they're stored in plain text in the code, so this is a simple
access gate, not real security. Anyone who views the page source could
find the password, so don't use this for anything highly sensitive.

## What it does
- **Add → Add a New Bag**: a 6-step wizard (image, name, description,
  price, catalog, review) with Back/Next, a Cancel button that asks for
  confirmation, and every field required. Saving adds it straight to the
  live storefront catalog.
- **Add → Add Catalog**: create a brand-new skin/category (beyond Snake,
  Crocodile, Ostrich) that immediately appears in the storefront's
  filter dropdown.
- **Edit**: search for a bag by name, then update its photo, name,
  description, and price.
- **Delete**: search for a bag, then confirm with the password before
  it's removed from the storefront.

## A note on images
Bag photos uploaded here are stored as embedded image data directly in
the browser's local storage. This works well for a modest catalog, but
browsers cap local storage around 5–10MB total, so a very large photo
library could eventually hit that ceiling. If you expect to manage many
products with large photos, it's worth moving to real image hosting
(e.g. Cloudinary) down the line.

## Resetting the catalog back to defaults
Open the browser console on the storefront and run:
```js
localStorage.removeItem('mecoso_shared_products');
localStorage.removeItem('mecoso_shared_categories');
```
This clears any edits and restores the original 6 bags and 3 categories.
