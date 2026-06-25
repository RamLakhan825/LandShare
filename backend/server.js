

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
app.use("/pricePrediction/model2", require("./routes/pricePredictionV2"));

// server.js
const accuracyRoutes = require("./routes/accuracy");
app.use("/api/ipo", accuracyRoutes); 


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
