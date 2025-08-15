import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import BuyButton from "./BuyButton";
import SellButton from "./SellButton";

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
    const { open, high, low, close, date } = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-md shadow-lg text-sm font-sans">
        <p className="font-semibold mb-1">{date}</p>
        <p>Open: ₹{open.toFixed(2)}</p>
        <p>High: ₹{high.toFixed(2)}</p>
        <p>Low: ₹{low.toFixed(2)}</p>
        <p>Close: ₹{close.toFixed(2)}</p>
      </div>
    );
  }
  return null;
}

// Custom candle renderer
const renderCustomizedBar = (props) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, close, high, low } = payload;
  const isBull = close >= open;
  const color = isBull ? "#22c55e" : "#ef4444";
  
  // Vertical wick
  const wickX = x + width / 2;

  // Candle body
  const bodyY = y + ((high - Math.max(open, close)) / (high - low)) * height;
  const bodyHeight = Math.max(
    2,
    Math.abs(((close - open) / (high - low || 1)) * height)
  );

  return (
    <g>
      <line
        x1={wickX}
        y1={y}
        x2={wickX}
        y2={y + height}
        stroke={color}
        strokeWidth={2}
      />
      <rect
        x={x + width * 0.25}
        y={bodyY}
        width={width * 0.5}
        height={bodyHeight}
        fill={color}
        rx={2}
        ry={2}
      />
    </g>
  );
};

export default function IpoCard({ ipo, isAdmin, refresh, holdings, user }) {
  const [priceHistory, setPriceHistory] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        const res = await fetch(
          `https://landshare-2.onrender.com/ipo/${ipo.id}/price-history`
        );
        const data = await res.json();

        if (!Array.isArray(data)) {
          setPriceHistory([]);
          return;
        }

        const formatted = data.map((c) => ({
          
          date: new Date(c.timestamp).toLocaleString(),
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
        }));

        setPriceHistory(formatted);
      } catch (err) {
        console.error("Error fetching price history:", err);
        setPriceHistory([]);
      }
    }

    if (ipo?.id) {
      fetchPriceHistory();
    }
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
    if (data.ipoId === ipo.id) {
      refresh();
    }
  };

  const allPrices = priceHistory.flatMap((c) => [c.low, c.high]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.05 || 1;

  return (
    <div className="w-full md:max-w-lg mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col space-y-6 font-sans overflow-hidden">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {ipo.ownerName}
        </h3>
        <p className="text-gray-600 text-sm mb-1">{ipo.address}</p>
        <div className="flex space-x-4 text-gray-700 text-sm">
          <span>📞 {ipo.contactNo}</span>
          <span>✉️ {ipo.email}</span>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-gray-700 text-sm">
        <div>
          <strong>Size:</strong> {ipo.landSize} sq ft
        </div>
        <div>
          <strong>Facilities:</strong> {ipo.features}
        </div>
        <div>
          <strong>Share Price:</strong> ₹{ipo.shareCost}
        </div>
        <div>
          <strong>Available Shares:</strong> {ipo.availableShares}
        </div>
        <div>
          <strong>Total Shares:</strong> {ipo.totalShares}
        </div>
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
            <BuyButton ipo={ipo} onIpoUpdate={handleIpoUpdate} />
          )}
          {holdings.some(
            (h) =>
              h.userEmail === user?.email &&
              h.ipoId === ipo.id &&
              h.shares > 0
          ) && (
            <SellButton
              ipo={ipo}
              userEmail={user?.email}
              onIpoUpdate={handleIpoUpdate}
            />
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Buttons always outside chart */}
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
          className={`bg-gray-50 rounded-lg p-4 shadow-inner ${
            isFullscreen
              ? "fixed inset-0 z-40 bg-white flex flex-col items-center justify-center p-4"
              : "overflow-x-auto"
          }`}
        >
          <ResponsiveContainer
            width={
              isFullscreen
                ? "100%"
                : Math.max(priceHistory.length * 40, 550)
            }
            height={isFullscreen ? window.innerHeight - 100 : 250}
          >
            <ComposedChart
              data={priceHistory}
              margin={{ top: 15, right: 30, bottom: 20, left: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#4b5563" }}
                interval="preserveStartEnd"
                minTickGap={5}
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                type="number"
                domain={[minPrice - padding, maxPrice + padding]}
                tickFormatter={(tick) => `₹${tick.toFixed(2)}`}
                tick={{ fontSize: 10, fill: "#666" }}
                axisLine={{ stroke: "#bbb" }}
                tickLine={false}
              />
              <Tooltip
                content={<CandleTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar
                dataKey="close"
                shape={renderCustomizedBar}
                isAnimationActive={false}
                maxBarSize={14}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
