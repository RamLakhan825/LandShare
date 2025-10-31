// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const session = require("express-session");
// const http = require("http"); // required for socket.io
// const { Server } = require("socket.io");

// const db = require("./models"); // includes sequelize + models

// const startFluctuationLoop = require('./utils/fluctuatePrices');


// dotenv.config();

// const app = express();
// const server = http.createServer(app); // wrap app with HTTP server

// // Initialize Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: "https://land-share-825.vercel.app",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });


// startFluctuationLoop(io);


// // Middleware
// // app.use(cors({
// //   origin: 'https://land-share-825.vercel.app',
// //   credentials: true
// // }));

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://land-share-825.vercel.app"
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // allow requests with no origin (like mobile apps or curl)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true
// }));


// app.use(express.json());

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: false,
//     sameSite: 'lax'
//   }
// }));


// // Routes
// const authRoutes = require("./routes/authRoutes");
// const ipoRoutes = require("./routes/ipo");
// const transactionRoutes = require("./routes/transaction");
// const holdingsRoutes = require("./routes/holdings");
// const pricePredictionRoute = require("./routes/pricePrediction");

// app.use("/api/auth", authRoutes);
// app.use("/ipo", ipoRoutes);
// app.use("/transaction", transactionRoutes);
// app.use("/api/holdings", holdingsRoutes);
// const contactRoutes = require("./routes/contact");
// app.use("/contact", contactRoutes);
// app.use("/pricePrediction", pricePredictionRoute);


// // Socket events
// io.on("connection", (socket) => {
//   //console.log("A user connected:", socket.id);

//   // Example: Emit welcome message
//   socket.emit("welcome", { message: "Connected to server" });

//   // Example: Receive IPO updates
//   socket.on("newIPO", (ipoData) => {
//     //console.log("New IPO data:", ipoData);
//     // Broadcast to all clients except sender
//     socket.broadcast.emit("ipoAdded", ipoData);
//   });

//   // Example: Receive transactions
//   socket.on("newTransaction", (transactionData) => {
//     //console.log("New Transaction:", transactionData);
//     io.emit("transactionAdded", transactionData); // emit to all
//   });

//   socket.on("disconnect", () => {
//     //console.log("User disconnected:", socket.id);
//   });
// });

// ///Start server after DB sync
// db.sequelize.sync().then(() => {
//   server.listen(process.env.PORT, () =>
//     console.log(`Server running on port ${process.env.PORT}`)
//   );
// });

// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");

const db = require("./models"); // Sequelize + models
const startFluctuationLoop = require("./utils/fluctuatePrices"); // price prediction loop

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins for both HTTP & Socket.IO
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://land-share-825.vercel.app"
];

// -----------------
// Socket.IO Setup
// -----------------
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // allow non-browser clients like Postman
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Start price fluctuation & prediction loop
startFluctuationLoop(io);

// -----------------
// Middleware
// -----------------
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, sameSite: 'lax' }
}));

// -----------------
// Routes
// -----------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/ipo", require("./routes/ipo"));
app.use("/transaction", require("./routes/transaction"));
app.use("/api/holdings", require("./routes/holdings"));
app.use("/contact", require("./routes/contact"));
app.use("/pricePrediction", require("./routes/pricePrediction"));

// -----------------
// Socket.IO Events
// -----------------
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.emit("welcome", { message: "Connected to server" });

  // Example: broadcast new IPO to everyone except sender
  socket.on("newIPO", (ipoData) => {
    socket.broadcast.emit("ipoAdded", ipoData);
  });

  // Example: broadcast new transaction to all
  socket.on("newTransaction", (transactionData) => {
    io.emit("transactionAdded", transactionData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// -----------------
// Start Server
// -----------------
db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
