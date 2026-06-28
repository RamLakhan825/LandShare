import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import BuyButton from "./BuyButton";
import SellButton from "./SellButton";

const API = import.meta.env.VITE_API_URL;

// Recharts
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  ResponsiveContainer,
} from "recharts";

// Tooltip for chart
function CandleTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { open, high, low, close, date, predicted, predicted2 } = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-md shadow-lg text-sm font-sans">
        <p className="font-semibold mb-1">{date}</p>
        {open !== null && <p>Open: ₹{open.toFixed(2)}</p>}
        {high !== null && <p>High: ₹{high.toFixed(2)}</p>}
        {low !== null && <p>Low: ₹{low.toFixed(2)}</p>}
        {close !== null && <p>Close: ₹{close.toFixed(2)}</p>}
        {predicted !== null && (
          <p className="text-blue-600 font-semibold">Model 1 Predicted: ₹{predicted.toFixed(2)}</p>
        )}
        {predicted2 !== null && (
          <p className="text-gray-700 font-semibold">Model 2 Predicted: ₹{predicted2.toFixed(2)}</p>
        )}
      </div>
    );
  }
  return null;
}

// Custom candle renderer with larger offsets
const renderCustomizedBar = (props) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, close, high, low, predicted, predicted2 } = payload;

  const drawCandle = (o, c, color, offset = 0, candleWidth = width * 0.25) => {
    if (o === null || c === null) return null;
    const wickX = x + width / 2 + offset;
    const bodyY = y + ((high - Math.max(o, c)) / (high - low || 1)) * height;
    const bodyHeight = Math.max(2, Math.abs((c - o) / (high - low || 1) * height));
    return (
      <g key={color + x + offset}>
        <line
          x1={wickX}
          y1={y}
          x2={wickX}
          y2={y + height}
          stroke={color}
          strokeWidth={2}
          opacity={0.9}
        />
        <rect
          x={x + width / 2 - candleWidth / 2 + offset}
          y={bodyY}
          width={candleWidth}
          height={bodyHeight}
          fill={color}
          opacity={0.9}
          rx={2}
          ry={2}
        />
      </g>
    );
  };

  return (
    <g>
      {/* Model 1 predicted candle (bright blue, left, larger gap) */}
      {predicted !== null && drawCandle(open, predicted, "#3b82f6", -width * 0.3)}
      {/* Model 2 predicted candle (dark gray, right, larger gap) */}
      {predicted2 !== null && drawCandle(open, predicted2, "#374151", width * 0.3)}
      {/* Actual candle (green/red center) */}
      {predicted === null && predicted2 === null && drawCandle(open, close, close >= open ? "#22c55e" : "#ef4444")}
    </g>
  );
};

export default function IpoCard({ ipo, isAdmin, refresh, holdings, user }) {
  const [priceHistory, setPriceHistory] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        // Historical prices
        const historyRes = await fetch(
          `${API}/ipo/${ipo.id}/price-history`
        );
        const historyData = await historyRes.json();
        if (!Array.isArray(historyData)) return setPriceHistory([]);

        // Model 1 predicted price
        const prediction1Res = await fetch(
          `${API}/pricePrediction/${ipo.id}/latest`
        );
        const prediction1Data = await prediction1Res.json();
        const predictedPrice1 = prediction1Data?.predictedPrice || null;

        // Model 2 predicted price
        const prediction2Res = await fetch(
          `${API}/pricePrediction/model2/${ipo.id}/latest`
        );
        const prediction2Data = await prediction2Res.json();
        const predictedPrice2 = prediction2Data?.predictedPriceV2 || null;

        // Accuracy
        const accRes = await fetch( `${API}/api/ipo/${ipo.id}/accuracy`);
        const accData = await accRes.json();
        setAccuracy(accData);

        // Format historical data
        const formatted = historyData.map((c) => ({
          date: new Date(c.timestamp).toLocaleString(),
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
          predicted: null,
          predicted2: null,
        }));

        // Add 5 predicted candles for both models
        if (predictedPrice1 !== null || predictedPrice2 !== null) {
          let lastClose = formatted[formatted.length - 1].close;
          for (let i = 1; i <= 5; i++) {
            const fluctuation1 = (Math.random() - 0.5) * 10; // Model 1
            const fluctuation2 = (Math.random() - 0.5) * 10; // Model 2

            const open = lastClose;
            const close1 = predictedPrice1 !== null ? predictedPrice1 + fluctuation1 : null;
            const close2 = predictedPrice2 !== null ? predictedPrice2 + fluctuation2 : null;
            const high = Math.max(open, close1 ?? open, close2 ?? open) + Math.random() * 5;
            const low = Math.min(open, close1 ?? open, close2 ?? open) - Math.random() * 5;

            formatted.push({
              date: `Prediction +${i}`,
              open,
              high,
              low,
              close: close1 ?? open,
              predicted: close1 !== null ? close1 : null,
              predicted2: close2 !== null ? close2 : null,
            });

            lastClose = close1 ?? lastClose;
          }
        }

        setPriceHistory(formatted);
      } catch (err) {
        console.error("Error fetching price history or predictions:", err);
        setPriceHistory([]);
      }
    }

    if (ipo?.id) fetchPriceHistory();
  }, [ipo.id]);

  const approve = async () => {
    try {
      const { error } = await supabase
        .from("ipos")
        .update({ status: "approved" })
        .eq("id", ipo.id);
      if (error) throw error;
      refresh();
    } catch (err) {
      console.error("Error approving IPO:", err);
    }
  };

  const renderFileLink = (label, url) => {
    if (!url) return null;
    const isPDF = url.endsWith(".pdf");
    return (
      <p className="text-xs text-gray-600 truncate max-w-full">
        <strong>{label}:</strong>{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline"
          title={`View ${label}`}
        >
          {isPDF ? `View ${label} (PDF)` : `View ${label}`}
        </a>
      </p>
    );
  };

  const handleIpoUpdate = (data) => {
    if (data.ipoId === ipo.id) refresh();
  };

  const allPrices = priceHistory.flatMap((c) =>
    [c.low, c.high, c.predicted, c.predicted2].filter((v) => v !== null && v !== undefined)
  );
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 100;
  const padding = (maxPrice - minPrice) * 0.05 || 1;

  return (
    <div className="w-full md:max-w-lg mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col space-y-6 font-sans overflow-hidden">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{ipo.ownerName}</h3>
        <p className="text-gray-600 text-sm mb-1">{ipo.address}</p>
        <div className="flex space-x-4 text-gray-700 text-sm">
          <span>📞 {ipo.contactNo}</span>
          <span>✉️ {ipo.email}</span>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-gray-700 text-sm">
        <div><strong>Size:</strong> {ipo.landSize} sq ft</div>
        <div><strong>Facilities:</strong> {ipo.features}</div>
        <div><strong>Share Price:</strong> ₹{ipo.shareCost}</div>
        <div><strong>Available Shares:</strong> {ipo.availableShares}</div>
        <div><strong>Total Shares:</strong> {ipo.totalShares}</div>
      </div>

      {/* Files */}
      <div className="space-y-1">
        {renderFileLink("Aadhaar", ipo.aadharUrl)}
        {renderFileLink("Land Document", ipo.landDocUrl)}
        {renderFileLink("Photo", ipo.photoUrl)}
        {renderFileLink("Signature", ipo.signatureUrl)}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isAdmin && ipo.status === "pending" && (
          <button
            onClick={approve}
            className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            Approve
          </button>
        )}
        <div className="ml-auto flex space-x-3">
          {ipo.approved && ipo.availableShares > 0 && (
            <BuyButton ipo={ipo} user={user} onIpoUpdate={handleIpoUpdate} />
          )}
          {holdings.some(h => h.userEmail === user?.email && h.ipoId === ipo.id && h.shares > 0) && (
            <SellButton ipo={ipo} userEmail={user?.email} onIpoUpdate={handleIpoUpdate} />
          )}
        </div>
      </div>

      {/* Accuracy Metrics */}
      {/* Accuracy Metrics */}
{accuracy && (
  <div className="bg-gray-100 p-3 rounded-md shadow-sm text-sm text-gray-800 mt-2 space-y-2">
    <p className="font-semibold">Prediction Accuracy:</p>
    
    {/* Model 1 */}
    <div className="flex justify-between">
      <span className="font-medium text-blue-700">Model 1 (LSTM):</span>
      <span>{accuracy.model1}%</span>
    </div>

    {/* Model 2 */}
    <div className="flex justify-between">
      <span className="font-medium text-gray-700">Model 2 (Random Forest):</span>
      <span>{accuracy.model2}%</span>
    </div>

    {/* More accurate model */}
    <p className="mt-1 font-semibold text-green-700">
      {accuracy.model1 > accuracy.model2
        ? "LSTM is more accurate"
        : accuracy.model2 > accuracy.model1
        ? "Random Forest is more accurate"
        : "Both models are equally accurate"}
    </p>
  </div>
)}
 

 
      {/* Chart */}
      <div className="relative">
        {isFullscreen ? (
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 z-50 bg-white px-3 py-1 rounded-md shadow hover:bg-gray-100 text-sm"
          >
            ✖ Close
          </button>
        ) : (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 z-20 bg-white px-3 py-1 rounded-md shadow hover:bg-gray-100 text-sm"
          >
            ⛶ Fullscreen
          </button>
        )}

        <div
          ref={chartContainerRef}
          className={`bg-gray-50 rounded-lg p-4 shadow-inner ${isFullscreen ? "fixed inset-0 z-40 bg-white flex flex-col items-center justify-center p-4" : "overflow-x-auto"}`}
        >
          <ResponsiveContainer width={isFullscreen ? "100%" : Math.max(priceHistory.length * 40, 550)} height={isFullscreen ? window.innerHeight - 100 : 300}>
            <ComposedChart data={priceHistory} margin={{ top: 15, right: 30, bottom: 20, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#4b5563" }} interval="preserveStartEnd" minTickGap={5} tickLine={false} axisLine={{ stroke: "#d1d5db" }} />
              <YAxis type="number" domain={[minPrice - padding, maxPrice + padding]} tickFormatter={tick => `₹${tick.toFixed(2)}`} tick={{ fontSize: 10, fill: "#666" }} axisLine={{ stroke: "#bbb" }} tickLine={false} />
              <Tooltip content={<CandleTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="close" shape={renderCustomizedBar} isAnimationActive={false} maxBarSize={14} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
