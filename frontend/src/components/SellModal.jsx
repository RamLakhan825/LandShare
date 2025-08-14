
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; // <-- import this
// import { createSellOrder, verifySellPayment } from "../utils/transaction";
// import axios from "../utils/api";

// export default function SellModal({ ipo, userEmail, onClose, onSuccess }) {
//   const navigate = useNavigate(); // <-- initialize navigate

//   const [shares, setShares] = useState(1);
//   const [userShares, setUserShares] = useState(0);
//   const [bankDetails, setBankDetails] = useState({
//     accountNumber: "",
//     ifsc: "",
//     accountHolderName: ""
//   });
//   const pricePerShare = Number(ipo.sharePrice || ipo.shareCost);

//   useEffect(() => {
//     const fetchUserShares = async () => {
//       try {
//         const res = await axios.get(`/api/holdings/${encodeURIComponent(userEmail)}`);
//         const holding = res.data.find(h => h.ipoId === ipo.id);
//         setUserShares(holding ? holding.shares : 0);
//       } catch (err) {
//         console.error("Error fetching holdings:", err);
//         setUserShares(0);
//       }
//     };

//     if (userEmail && ipo?.id) {
//       fetchUserShares();
//     }
//   }, [ipo?.id, userEmail]);

//   const handleSell = async (e) => {
//     e.preventDefault();
//     if (!shares || shares <= 0) return alert("Enter shares to sell");
//     if (shares > userShares) return alert("You don't own that many shares");
//     if (!bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountHolderName)
//       return alert("Please provide bank details for payout");

//     try {
//       const res = await createSellOrder({
//         ipoId: ipo.id,
//         shares,
//         sellerEmail: userEmail
//       });
//       const { orderId, amount, currency, txId } = res.data;

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount,
//         currency,
//         name: "LandShare",
//         description: `Sell ${shares} shares of ${ipo.ownerName || ipo.name}`,
//         order_id: orderId,
//         handler: async function (response) {
//           const verifyRes = await verifySellPayment({
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             txId,
//           });

// //           if (verifyRes.data && verifyRes.data.success) {
// //             // Trigger payout
// //             await axios.post("/transaction/payout", {
// //               sellerEmail: userEmail,
// //               amount,
// //               bankDetails
// //             });
// //             alert("Sell transaction successful. Payout initiated.");

// //             if (onSuccess) onSuccess();
// //             if (onClose) onClose();  
// //             //onClose();
// //             setTimeout(() => {
// //   window.location.reload();
// // }, 300);

//           // } else {
//           //   alert("Payment verification failed");
//           // }


//           if (verifyRes.data && verifyRes.data.success) {
//   alert("Sell transaction successful."); // ✅ always shown on success

//   try {
//     // RazorpayX needs paise
//     const payoutAmount = amount; // adjust if amount is in rupees: amount * 100
//     await axios.post("/transaction/payout", {
//       sellerEmail: userEmail,
//       amount: payoutAmount,
//       bankDetails
//     });
//     //alert("Payout initiated successfully.");
//   } catch (err) {
//     console.error("Payout failed", err);
//     //alert("Sell was successful, but payout failed. Please contact support.");
//   }

//   if (onSuccess) onSuccess();
//   if (onClose) onClose();
  
// } else {
//   //alert("Payment verification failed");
//   console.error("Sell flow error:", err);
//     // Even if verification fails, refresh homepage
//     if (onSuccess) onSuccess();
//     if (onClose) onClose();
// }

//         },
//         prefill: { name: userEmail, email: userEmail },
//         theme: { color: "#b91c1c" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error(err);
//       alert("Order creation failed");
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
//       <form onSubmit={handleSell} className="bg-white p-6 rounded shadow max-w-md w-full space-y-3">
//         <h3 className="text-xl font-bold mb-4">Sell {ipo.ownerName || ipo.name}</h3>
//         <p>Price per share: ₹{pricePerShare}</p>
//         <p>Your Shares: {userShares}</p>

//         <input
//           type="number"
//           min="1"
//           max={userShares}
//           value={shares}
//           onChange={(e) => setShares(Number(e.target.value))}
//           className="w-full border p-2"
//         />

//         <h4 className="font-semibold">Bank Details for Payout</h4>
//         <input
//           type="text"
//           placeholder="Account Holder Name"
//           value={bankDetails.accountHolderName}
//           onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
//           className="w-full border p-2"
//         />
//         <input
//           type="text"
//           placeholder="Account Number"
//           value={bankDetails.accountNumber}
//           onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
//           className="w-full border p-2"
//         />
//         <input
//           type="text"
//           placeholder="IFSC Code"
//           value={bankDetails.ifsc}
//           onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
//           className="w-full border p-2"
//         />

//         <div className="flex justify-between items-center">
//           <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
//             Cancel
//           </button>
//           <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">
//             Sell & Receive
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSellOrder, verifySellPayment } from "../utils/transaction";
import axios from "../utils/api";

export default function SellModal({ ipo, userEmail, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [shares, setShares] = useState(1);
  const [userShares, setUserShares] = useState(0);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifsc: "",
    accountHolderName: ""
  });
  const pricePerShare = Number(ipo.sharePrice || ipo.shareCost);

  useEffect(() => {
    const fetchUserShares = async () => {
      try {
        const res = await axios.get(`/api/holdings/${encodeURIComponent(userEmail)}`);
        const holding = res.data.find(h => h.ipoId === ipo.id);
        setUserShares(holding ? holding.shares : 0);
      } catch (err) {
        //console.error("Error fetching holdings:", err);
        setUserShares(0);
      }
    };
    if (userEmail && ipo?.id) fetchUserShares();
  }, [ipo?.id, userEmail]);

  const handleSell = async (e) => {
    e.preventDefault();
    if (!shares || shares <= 0) return;
    if (shares > userShares) return;
    if (!bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountHolderName) return;

    try {
      const res = await createSellOrder({ ipoId: ipo.id, shares, sellerEmail: userEmail });
      const { orderId, amount, currency, txId } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "LandShare",
        description: `Sell ${shares} shares of ${ipo.ownerName || ipo.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await verifySellPayment({
              razorpay_order_id: response?.razorpay_order_id,
              razorpay_payment_id: response?.razorpay_payment_id,
              razorpay_signature: response?.razorpay_signature,
              txId,
            });

            // Trigger payout regardless of verification outcome
            try {
              const payoutAmount = amount; // RazorpayX might need paise
              await axios.post("/transaction/payout", {
                sellerEmail: userEmail,
                amount: payoutAmount,
                bankDetails,
              });
            } catch (err) {
              //console.error("Payout failed", err);
            }

            // Always refresh parent state
            if (onSuccess) onSuccess();
            if (onClose) onClose();

          } catch (err) {
            //console.error("Sell flow error", err);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
          }
        },
        prefill: { name: userEmail, email: userEmail },
        theme: { color: "#b91c1c" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      //console.error("Order creation failed", err);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <form onSubmit={handleSell} className="bg-white p-6 rounded shadow max-w-md w-full space-y-3">
        <h3 className="text-xl font-bold mb-4">Sell {ipo.ownerName || ipo.name}</h3>
        <p>Price per share: ₹{pricePerShare}</p>
        <p>Your Shares: {userShares}</p>

        <input
          type="number"
          min="1"
          max={userShares}
          value={shares}
          onChange={(e) => setShares(Number(e.target.value))}
          className="w-full border p-2"
        />

        <h4 className="font-semibold">Bank Details for Payout</h4>
        <input
          type="text"
          placeholder="Account Holder Name"
          value={bankDetails.accountHolderName}
          onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
          className="w-full border p-2"
        />
        <input
          type="text"
          placeholder="Account Number"
          value={bankDetails.accountNumber}
          onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
          className="w-full border p-2"
        />
        <input
          type="text"
          placeholder="IFSC Code"
          value={bankDetails.ifsc}
          onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
          className="w-full border p-2"
        />

        <div className="flex justify-between items-center">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">
            Sell & Receive
          </button>
        </div>
      </form>
    </div>
  );
}
