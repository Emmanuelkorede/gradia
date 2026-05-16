import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { loadPaystackScript, openPaystackPopup } from "../lib/paystackHelper";

// ------------------------------------------------------------------
// usePaystack()
// Wraps the Paystack inline flow in a clean React hook.
//
// Usage:
//   const { pay, paying, paid, error } = usePaystack();
//   <button onClick={pay} disabled={paying}>Unlock Premium</button>
// ------------------------------------------------------------------

export function usePaystack() {
  const { user, profile, refreshProfile } = useAuth();

  const [paying, setPaying] = useState(false); // Modal is open / processing
  const [paid,   setPaid]   = useState(false); // Payment completed this session
  const [error,  setError]  = useState(null);  // Any error message

  // Load the Paystack script as soon as this hook mounts
  useEffect(() => {
    loadPaystackScript().catch((err) => {
      setError("Could not load payment system. Check your internet connection.");
      console.error(err);
    });
  }, []);

  /**
   * Opens the Paystack popup.
   * Calling this when the user is not logged in does nothing (safety guard).
   */
  async function pay() {
    if (!user) {
      setError("You must be logged in to make a payment.");
      return;
    }

    setError(null);
    setPaying(true);

    openPaystackPopup({
      email:       user.email,
      userId:      user.id,
      displayName: profile?.display_name || "Student",

      onSuccess: async (reference) => {
        // Payment popup closed after success.
        // The actual is_premium update happens via your Supabase Edge Function
        // webhook — we just wait for the realtime subscription in AuthContext
        // to fire, then refresh manually as a safety net.
        console.log("Payment successful, ref:", reference);
        setPaid(true);
        setPaying(false);

        // Refresh profile after a short delay to catch the webhook update
        setTimeout(() => {
          refreshProfile();
        }, 3000);
      },

      onClose: () => {
        // User closed the modal without paying
        setPaying(false);
      },
    });
  }

  return {
    pay,
    paying, // true while the modal is open
    paid,   // true after a successful payment this session
    error,
  };
}