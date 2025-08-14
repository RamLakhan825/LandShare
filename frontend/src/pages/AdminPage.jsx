import { useEffect, useState } from 'react';
import { getPendingIPOs, approveIPO, deleteIPO } from '../utils/ipo';
import axios from 'axios'; 

export default function AdminPage() {
  const [pending, setPending] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const load = async () => {
      const data = await getPendingIPOs(token);
      setPending(data);
    };
    load();
  }, []);

  const handleApprove = async (id) => {
    await approveIPO(id, token);
    alert('Approved!');
    setPending(pending.filter((ipo) => ipo.id !== id));
  };

  const handleDecline = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to decline and delete this IPO?');
    if (confirmDelete) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/ipo/decline/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('IPO Declined & Email Sent');
    setPending(pending.filter((ipo) => ipo.id !== id));
  }
};

  // Helper to render file links
  const renderFileLink = (label, url) => {
    if (!url) return null;
    const isPDF = url.endsWith('.pdf');

    return (
      <p>
        <strong>{label}:</strong>{' '}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {isPDF ? `View ${label} (PDF)` : `View ${label}`}
        </a>
      </p>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pending IPO Approvals</h2>
      {pending.map((ipo) => (
        <div key={ipo.id} className="border p-4 mb-6 bg-white rounded shadow space-y-1">
          <p><strong>Owner Name:</strong> {ipo.ownerName}</p>
          <p><strong>Email:</strong> {ipo.email}</p>
          <p><strong>Contact:</strong> {ipo.contactNo}</p>
          <p><strong>Address:</strong> {ipo.address}</p>
          <p><strong>Land Size:</strong> {ipo.landSize} sq ft</p>
          <p><strong>Facilities:</strong> {ipo.features || 'N/A'}</p>
          <p><strong>Share Cost:</strong> ₹{ipo.shareCost}</p>
          <p><strong>Available Share:</strong> {ipo.availableShares}</p>
          <p><strong>Total Share:</strong> {ipo.totalShares}</p>

          {/* File Links */}
          {renderFileLink('Aadhaar', ipo.aadharUrl)}
          {renderFileLink('Land Document', ipo.landDocUrl)}
          {renderFileLink('Photo', ipo.photoUrl)}
          {renderFileLink('Signature', ipo.signatureUrl)}

          {/* Action Buttons */}
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleApprove(ipo.id)}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecline(ipo.id)}
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
