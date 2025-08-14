import { useState, useEffect } from "react";
import BuyModal from "./BuyModal";
import { io } from "socket.io-client";

export default function BuyButton({ ipo, onIpoUpdate }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace("/api","") || "https://landshare-2.onrender.com");
    socket.on("ipo:update", (data) => {
      if (data.ipoId === ipo.id && onIpoUpdate) onIpoUpdate(data);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-green-600 px-3 py-1 rounded text-white">Buy</button>
      {open && <BuyModal ipo={ipo} onClose={() => setOpen(false)} onSuccess={() => { if(onIpoUpdate) onIpoUpdate({ ipoId: ipo.id }); }} />}
    </>
  );
}
