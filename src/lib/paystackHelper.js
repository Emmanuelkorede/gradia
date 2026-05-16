
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const AMOUNT_IN_KOBO = 200000; // ₦2,500 × 100 = 250,000 kobo


export function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    // Already loaded — nothing to do
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}

export function openPaystackPopup({ email, userId, displayName, onSuccess, onClose }) {
  if (!window.PaystackPop) {
    console.error("Paystack script not loaded. Call loadPaystackScript() first.");
    return;
  }

  if (!PAYSTACK_PUBLIC_KEY) {
    console.error("Missing VITE_PAYSTACK_PUBLIC_KEY in your .env file");
    return;
  }

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: AMOUNT_IN_KOBO,
    currency: "NGN",
    ref: `cbt-${userId}-${Date.now()}`, // Unique reference per attempt

    metadata: {
      custom_fields: [
        {
          display_name: "Display Name",
          variable_name: "display_name",
          value: displayName || "Student",
        },
        {
          // IMPORTANT: Your Supabase Edge Function webhook reads this
          // to know which user's is_premium to flip to TRUE
          display_name: "Supabase User ID",
          variable_name: "user_id",
          value: userId,
        },
      ],
    },

    callback: function (response) {
      // response.reference is the transaction ref you can verify server-side
      if (onSuccess) onSuccess(response.reference);
    },

    onClose: function () {
      if (onClose) onClose();
    },
  });

  handler.openIframe();
}