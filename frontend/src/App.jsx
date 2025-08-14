import { useAuth } from "./context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Home from "./pages/Home";
import IpoForm from "./components/IpoForm";
import AdminPage from "./pages/AdminPage";
import Dashboard from "./components/Dashboard";
import ContactUs from "./components/contactUs";
import Layout from "./components/Layout"; // ✅ import Layout

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <AuthForm /> : <Navigate to="/home" />}
      />

      <Route
        path="/home"
        element={user ? <Layout><Home /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/ipo-form"
        element={user ? <Layout><IpoForm /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard"
        element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/contact"
        element={user ? <Layout><ContactUs /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={
          user?.email === "rljangid825@gmail.com"
            ? <Layout><AdminPage /></Layout>
            : <Navigate to="/home" />
        }
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/home" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
