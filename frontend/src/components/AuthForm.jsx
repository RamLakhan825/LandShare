// import { useState } from "react";
// import axios from "axios";
// import { auth, provider } from "../firebase";
// import { signInWithPopup } from "firebase/auth";
// import { useAuth } from "../context/AuthContext";
// import loginImg from "../assets/login.jpg";
// import googleImg from "../assets/google.png"
// import registerImg from "../assets/register.jpg";
// import api from "../utils/api";

// const AuthForm = () => {
//   const { setUser } = useAuth();
//   const [isLogin, setIsLogin] = useState(true);
//   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 
//   const [form, setForm] = useState({ name: "", email: "", password: "" });

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const toggleMode = () => setIsLogin((prev) => !prev);

//   const handleSubmit = async (e) => {
    
//     e.preventDefault();
//     const url = isLogin ? `${BACKEND_URL}/api/auth/login` :  `${BACKEND_URL}/api/auth/register`;

//     try {
//       const res = await axios.post(url, form);
//       console.log(res);

//       // Save token, email, and userId in localStorage
//       // localStorage.setItem("token", res.data.token);
//       // localStorage.setItem("email", res.data.user.email);
//       // localStorage.setItem("userId", res.data.user.id);

//       // Update context
//       setUser(res.data.user);
//     } catch (err) {
//       console.log(err);
//       alert(err.response?.data?.msg || "Error");
//     }
//   };

//   const googleLogin = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const token = await result.user.getIdToken();

//       const res = await axios.post(`${BACKEND_URL}/api/auth/google-login`, { token });

//       // Save token, email, and userId in localStorage
//       // localStorage.setItem("token", res.data.token);
//       // localStorage.setItem("email", res.data.user.email);
//       // localStorage.setItem("userId", res.data.user.id);

//       // Update context
//       setUser(res.data.user);
//     } catch (err) {
//       console.error("Google login error:", err.response?.data?.message || err.message);
//       alert("Google login failed");
//     }
//   };

//   return (
//     <div className="h-screen w-screen bg-gradient-to-br from-purple-600 to-pink-500 flex justify-center items-center">
//       <div className="relative w-[90%] max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
//         <div
//           className={`w-[200%] h-full flex transition-transform duration-700 ease-in-out ${
//             isLogin ? "translate-x-0" : "-translate-x-1/2"
//           }`}
//         >
//           {/* Login Panel */}
//           <div className="w-1/2 flex flex-row">
//             <div className="w-1/2 bg-gray-100 flex items-center justify-center">
//               <img src={loginImg} alt="Login" className="w-full h-auto p-4" />
//             </div>
//             <div className="w-1/2 px-8 py-10 flex flex-col justify-center">
//               <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
//               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   onChange={handleChange}
//                   required
//                   className="p-2 border border-gray-300 rounded"
//                 />
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   onChange={handleChange}
//                   required
//                   className="p-2 border border-gray-300 rounded"
//                 />
//                 <button className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
//                   Login
//                 </button>
//               </form>
//               <p className="mt-4 text-center text-sm text-gray-600">
//                 Don't have an account?
//                 <button
//                   onClick={toggleMode}
//                   className="text-blue-600 underline ml-1"
//                 >
//                   Register
//                 </button>
//               </p>
//               <div className="mt-4 text-center">
//                 <button
//                   onClick={googleLogin}
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition flex items-center gap-2 mx-auto"
//                 >
//                   <img src={googleImg} alt="Google" className="w-5 h-5" />
//                   Login with Google
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Register Panel */}
//           <div className="w-1/2 flex flex-row">
//             <div className="w-1/2 px-8 py-10 flex flex-col justify-center">
//               <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
//               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Name"
//                   onChange={handleChange}
//                   required
//                   className="p-2 border border-gray-300 rounded"
//                 />
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   onChange={handleChange}
//                   required
//                   className="p-2 border border-gray-300 rounded"
//                 />
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   onChange={handleChange}
//                   required
//                   className="p-2 border border-gray-300 rounded"
//                 />
//                 <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
//                   Register
//                 </button>
//               </form>
//               <p className="mt-4 text-center text-sm text-gray-600">
//                 Already have an account?
//                 <button
//                   onClick={toggleMode}
//                   className="text-blue-600 underline ml-1"
//                 >
//                   Login
//                 </button>
//               </p>
//             </div>
//             <div className="w-1/2 bg-gray-100 flex items-center justify-center">
//               <img
//                 src={registerImg}
//                 alt="Register"
//                 className="w-full h-auto p-4"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;


import { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import loginImg from "../assets/login.jpg";
import googleImg from "../assets/google.png";
import registerImg from "../assets/register.jpg";
import api from "../utils/api";

const AuthForm = () => {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMode = () => setIsLogin((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await api.post(endpoint, form);
      console.log(res);

      // Update context with user data
      setUser(res.data.user);

      // Optionally save to localStorage
      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("email", res.data.user.email);
      // localStorage.setItem("userId", res.data.user.id);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Error");
    }
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await api.post("/api/auth/google-login", { token });

      // Update context with user data
      setUser(res.data.user);

      // Optionally save to localStorage
      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("email", res.data.user.email);
      // localStorage.setItem("userId", res.data.user.id);
    } catch (err) {
      console.error(
        "Google login error:",
        err.response?.data?.message || err.message
      );
      alert("Google login failed");
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-purple-600 to-pink-500 flex justify-center items-center">
      <div className="relative w-[90%] max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div
          className={`w-[200%] h-full flex transition-transform duration-700 ease-in-out ${
            isLogin ? "translate-x-0" : "-translate-x-1/2"
          }`}
        >
          {/* Login Panel */}
          <div className="w-1/2 flex flex-row">
            <div className="w-1/2 bg-gray-100 flex items-center justify-center">
              <img src={loginImg} alt="Login" className="w-full h-auto p-4" />
            </div>
            <div className="w-1/2 px-8 py-10 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded"
                />
                <button className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
                  Login
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?
                <button
                  onClick={toggleMode}
                  className="text-blue-600 underline ml-1"
                >
                  Register
                </button>
              </p>
              <div className="mt-4 text-center">
                <button
                  onClick={googleLogin}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition flex items-center gap-2 mx-auto"
                >
                  <img src={googleImg} alt="Google" className="w-5 h-5" />
                  Login with Google
                </button>
              </div>
            </div>
          </div>

          {/* Register Panel */}
          <div className="w-1/2 flex flex-row">
            <div className="w-1/2 px-8 py-10 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded"
                />
                <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                  Register
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?
                <button
                  onClick={toggleMode}
                  className="text-blue-600 underline ml-1"
                >
                  Login
                </button>
              </p>
            </div>
            <div className="w-1/2 bg-gray-100 flex items-center justify-center">
              <img
                src={registerImg}
                alt="Register"
                className="w-full h-auto p-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
