/* ===========================================================
   MECOSO HANDCRAFTED — Order email notifications
   ===========================================================
   
=========================================================== */

const EMAILJS_PUBLIC_KEY = "AcVFrsgoc0QA6biUx";
const EMAILJS_SERVICE_ID = "service_072yawq";
const EMAILJS_TEMPLATE_ID = "template_93d6z0n";
const NOTIFY_EMAIL = "lightokereke5@gmail.com";

function emailJsReady() {
  return (
    typeof emailjs !== "undefined" &&
    EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY"
  );
}

function initEmailJs() {
  if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
}

/**
 * Sends the order notification. Resolves either way so checkout
 * flow never gets blocked by email configuration.
 */
function sendOrderNotification(order) {
  const itemsText = order.items
    .map(i => `${i.name} (${i.categoryLabel}) x${i.qty} — ${formatNaira(i.price * i.qty)}`)
    .join("\n");

  const payload = {
    to_email: NOTIFY_EMAIL,
    customer_email: order.email,
    customer_address: order.address,
    order_items: itemsText,
    order_total: formatNaira(order.total)
  };

  console.log("MECOSO order captured:", payload);

  if (emailJsReady()) {
    return emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload)
      .then(() => true)
      .catch(err => {
        console.warn("EmailJS send failed:", err);
        return false;
      });
  }
  return Promise.resolve(false);
}

document.addEventListener("DOMContentLoaded", initEmailJs);
