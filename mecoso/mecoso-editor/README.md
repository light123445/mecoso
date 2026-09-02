# Mecoso Editor

A companion admin site for managing the Mecoso Handcrafted catalog —
add, edit, and delete bags and catalog categories without touching code.

## How it works now (updated)
Earlier versions of this editor stored catalog changes in the browser's
local storage, which meant edits only showed up in the browser that made
them — not to real customers. **That's been replaced.** The catalog now
lives in a real shared data store (Netlify Blobs), accessed through a
small serverless function at `/netlify/functions/products.js`. The
storefront and the editor both talk to that same function, so every
visitor, on any device, anywhere, sees the same live catalog.

## Login
- Username: `mimi`
- Password: `4321`

Change these in `js/auth.js` (`EDITOR_USERNAME` / `EDITOR_PASSWORD`) any
time. This is a simple access gate for the editor's *interface*, not
real security — see the next section for what actually protects your data.

## Securing the write access (recommended)
Right now, saving/editing/deleting is protected by a shared key
(`EDITOR_API_KEY`) that defaults to `"mecoso-editor-4321"` if you don't
set anything else. Anyone who reads the source code could find this
default value, so for a real store it's worth changing it:

1. On Netlify: **Site configuration → Environment variables → Add a variable**
   - Key: `EDITOR_API_KEY`
   - Value: any long random string you choose
2. Open `mecoso-editor/js/store.js` and change the `EDITOR_API_KEY`
   constant near the top to the **exact same value**.
3. Commit and redeploy.

Both sides need to match — the function checks the value you set in
Netlify's environment variables; the editor sends the value hardcoded
in `store.js`.

## What it does
- **Add → Add a New Bag**: a 6-step wizard (image, name, description,
  price, catalog, review) with Back/Next, a Cancel button that asks for
  confirmation, and every field required. Saving adds it straight to the
  shared catalog — visible to every visitor within seconds.
- **Add → Add Catalog**: create a brand-new skin/category (beyond Snake,
  Crocodile, Ostrich) that immediately appears in the storefront's
  filter dropdown for everyone.
- **Edit**: search for a bag by name, then update its photo, name,
  description, and price.
- **Delete**: search for a bag, then confirm with the password before
  it's removed from the storefront.

## A note on images
Photos are automatically resized and compressed in the browser before
being sent (max ~1000px, JPEG ~82% quality) — this keeps things fast on
mobile and keeps the stored catalog small. There's a 25MB limit on the
original file you select, well above what any phone photo needs.

## Deployment requirements
This now needs two extra things in your GitHub repo (beyond the
`mecoso` and `mecoso-editor` folders) for the shared backend to work:
- `netlify/functions/products.js` — the serverless function
- `package.json` — declares the `@netlify/blobs` dependency the function needs
- `netlify.toml` — tells Netlify where the publish folder and functions folder are

See the main deployment note (sent alongside this) for the exact file
list to add/replace on GitHub.

## If something looks out of sync
The storefront and editor both fetch fresh data on every page load
(`cache: "no-store"`), so changes should appear within a few seconds of
saving — just refresh the page you're viewing. If a save fails, you'll
now see an actual error message explaining why (rather than it just
silently not working), since every save/edit/delete checks whether the
server confirmed success before saying so.
