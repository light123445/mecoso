# Mecoso Handcrafted — Website

A 4-page e-commerce site: **Home**, **Catalog**, **Cart**, **Payment**.

## add images 
 the images are in the assets folder and if you want to add an image to this website you cpy the image to that folder then add it to the html file 

```
assets/logo_text.jpeg      ("Mecoso Handcrafted" wordmark — used as the home button)
assets/background1.jpeg    (home page rotating background)
assets/background2.jpeg
assets/background3.jpeg
assets/background4.jpeg
assets/background5.jpeg
assets/bag1.jpeg           → "The Third Mainland" (Snake Skin)
assets/bag2.jpeg           → "The Adaeze" (Snake Skin)
assets/bag3.jpeg           → "The Amara" (Crocodile Skin)
assets/bag4.jpeg           → "The Aureus" (Crocodile Skin)
assets/bag5.jpeg           → "The Ifeoma" (Ostrich Skin)
assets/bag6.jpeg           → "The Kaleidoscope" (Ostrich Skin)
```

Rename/reassign bags or edit their names, descriptions, or category in
`js/cart.js` (top of the file, `PRODUCTS` array) any time.

## How it works
- **Home** (`index.html`): backgrounds 1–5 cross-fade every 5 seconds behind
  a soft gold script "This is Mecoso," rendered in a script font (not the
  black-background text image) so it blends into any photo. Hamburger menu
  top-right opens a drawer with Home / Catalog / Cart. Instagram + email
  icons sit at the bottom.
- **Catalog** (`catalog.html`): dropdown filters by Snake / Crocodile /
  Ostrich skin. Each card has an "Add to Cart" button. Cart persists in the
  browser (localStorage) as the customer moves between pages.
- **Cart** (`cart.html`): shows items, quantities, running total, and a
  form for the buyer's email + delivery address. "Buy" validates the form,
  saves the order, and moves to Payment.
- **Payment** (`checkout.html`): shows your Opay account number
  (8132672315) and account name (Okereke Light Ebubechi) with the total
  due. "Confirm Payment" plays a checkmark animation, shows a thank-you
  message, and triggers the order notification email.



## Editing prices
All bags are currently ₦100,000. Change the `price` field per product in
`js/cart.js`.

## Hosting
This is a plain static site — upload the whole `mecoso` folder to any
static host (Netlify, Vercel, GitHub Pages, or your own server) and it
will work as-is.
