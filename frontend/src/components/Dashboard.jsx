import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserHoldings } from "../utils/holdingsApi";

function Dashboard() {
  const [holdings, setHoldings] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    getUserHoldings(user.email)
      .then((res) => setHoldings(res.data))
      .catch((err) => console.error("Error fetching holdings:", err));
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 My Holdings</h2>
      {holdings.length === 0 ? (
        <p className="text-gray-600 bg-white p-4 rounded shadow">
          You don’t own any shares yet.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Owner Name</th>
    <th className="px-6 py-3 text-right">Shares Owned</th>
    <th className="px-6 py-3 text-right">Purchase Price</th>
    <th className="px-6 py-3 text-right">Current Price</th>
    <th className="px-6 py-3 text-right">Total Value</th>
    <th className="px-6 py-3 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
    const purchasePrice = Number(h.purchasePrice || 0);
    const currentPrice = Number(h.Ipo?.shareCost || 0);
    const shares = h.shares;
    const totalValue = shares * currentPrice;
    const investedValue = shares * purchasePrice;
    const profitLoss = totalValue - investedValue;
    const profitLossColor = profitLoss >= 0 ? "text-green-700" : "text-red-600";

    return (
      <tr
        key={h.id}
        className={`hover:bg-green-50 transition ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
      >
        <td className="px-6 py-3 font-medium">{h.Ipo?.ownerName || "Unknown Owner"}</td>
        <td className="px-6 py-3 text-right">{shares}</td>
        <td className="px-6 py-3 text-right">
          ₹{purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="px-6 py-3 text-right">
          ₹{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="px-6 py-3 text-right font-semibold text-gray-900">
          ₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className={`px-6 py-3 text-right font-semibold ${profitLossColor}`}>
          {profitLoss >= 0 ? "▲ " : "▼ "}
          ₹{Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    );
  })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
