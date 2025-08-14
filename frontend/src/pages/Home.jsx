
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import IpoCard from "../components/IpoCard";
import axios from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

function Home() {
  const [ipoList, setIpoList] = useState([]);
   const [holdings, setHoldings] = useState([]);
  const { user } = useAuth();

  const fetchIpos = async () => {
    try {
      const res = await axios.get("/ipo/list");
      setIpoList(res.data);
    } catch (err) {
      console.error("Error fetching IPOs:", err);
    }
  };

  const fetchHoldings = async () => {
    //if (!user?.email) return;
    try {
      if (!user?.email) return; // ensure user is loaded
const res = await axios.get(`/api/holdings/${encodeURIComponent(user.email)}`);

      setHoldings(res.data);
      console.log("Holdings from API:", res.data);
console.log("Current user:", user?.email);

    } catch (err) {
      console.error("Error fetching holdings:", err);
    }
  };

  useEffect(() => {
    fetchIpos();
    fetchHoldings();
  }, [user]);

  const isAdmin = user?.email === adminEmail;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="px-6 py-4">
        <h1 className="text-2xl mb-2">
          Welcome {user?.email}
        </h1>

        {isAdmin && (
          <Link
            to="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded inline-block mb-4"
          >
            Go to Admin Panel
          </Link>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isAdmin ? "All IPO Listings" : "Available Stocks"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ipoList
            .filter((ipo) => Boolean(ipo.approved))
            .map((ipo) => (
              <IpoCard key={ipo.id} ipo={ipo} isAdmin={isAdmin} 
              refresh={() => {
                  fetchIpos();
                  fetchHoldings(); // Refresh holdings too
                }}
                holdings={holdings} 
                user={user} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Home;

