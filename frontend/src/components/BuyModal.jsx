import { useState } from "react";
import { createOrder, verifyPayment } from "../utils/transaction";

export default function BuyModal({ ipo,, userEmail, onClose, onSuccess }) {
  const [shares, setShares] = useState(1);
  const email = userEmail; // or get from your auth context
  const pricePerShare = Number(
    ipo.shareCost ?? ipo.share_cost ?? ipo.sharePrice ?? ipo.share_price ?? 0
  );

  // Helper to load Razorpay script dynamically
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!shares || shares <= 0) return alert("Enter a valid number of shares");
    
    try {
      // Create order on backend
      const res = await createOrder({ ipoId: ipo.id, shares, buyerEmail: email });
      const { orderId, amount, currency, txId } = res.data;

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
        amount, // amount in paise
        currency,
        name: "LandShare",
        description: `Buy ${shares} shares of ${ipo.ownerName || ipo.name}`,
        order_id: orderId,
        handler: async function (response) {
          // Verify payment on backend
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            txId,
          });
          if (verifyRes.data && verifyRes.data.success) {
            //alert("Payment successful");
            if (onSuccess) onSuccess();
            onClose();
          } else {
            //alert("Payment verification failed");
          }
        },
        prefill: {
          name: email,
          email: email,
        },
        theme: {
          color: "#6b21a8",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Order creation failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <form
        onSubmit={handleBuy}
        className="bg-white p-6 rounded shadow max-w-md w-full"
      >
        <h3 className="text-xl font-bold mb-4">
          Buy {ipo.ownerName || ipo.name}
        </h3>
        <p>Price per share: ₹{pricePerShare}</p>
        <p>Available: {ipo.availableShares}</p>

        <input
          type="number"
          min="1"
          max={ipo.availableShares}
          value={shares}
          onChange={(e) => setShares(Number(e.target.value))}
          className="w-full border p-2 my-2"
        />

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Pay & Buy
          </button>
        </div>
      </form>
    </div>
  );
}
