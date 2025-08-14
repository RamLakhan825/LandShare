// src/components/SellButton.jsx
import { useState, useEffect } from "react";
import SellModal from "./SellModal";
import { io } from "socket.io-client";

export default function SellButton({ ipo, userEmail, onIpoUpdate }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000");
    socket.on("ipo:update", (data) => {
      if (data.ipoId === ipo.id && onIpoUpdate) onIpoUpdate(data);
    });
    return () => socket.disconnect();
  }, [ipo.id]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-red-600 px-3 py-1 rounded text-white ml-2">
        Sell
      </button>
      {open && (
        <SellModal
          ipo={ipo}
          userEmail={userEmail}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            //setOpen(false);
            if (onIpoUpdate) onIpoUpdate({ ipoId: ipo.id });
          }}
        />
      )}
    </>
  );
}
