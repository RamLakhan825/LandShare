const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const http = require("http"); // required for socket.io
const { Server } = require("socket.io");

const db = require("./models"); // includes sequelize + models

const startFluctuationLoop = require('./utils/fluctuatePrices');


dotenv.config();

const app = express();
const server = http.createServer(app); // wrap app with HTTP server

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://land-share-825.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});


startFluctuationLoop(io);


// Middleware
// app.use(cors({
//   origin: 'https://land-share-825.vercel.app',
//   credentials: true
// }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://land-share-825.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    sameSite: 'lax'
  }
}));


// Routes
const authRoutes = require("./routes/authRoutes");
const ipoRoutes = require("./routes/ipo");
const transactionRoutes = require("./routes/transaction");
const holdingsRoutes = require("./routes/holdings");

app.use("/api/auth", authRoutes);
app.use("/ipo", ipoRoutes);
app.use("/transaction", transactionRoutes);
app.use("/api/holdings", holdingsRoutes);
const contactRoutes = require("./routes/contact");
app.use("/contact", contactRoutes);


// Socket events
io.on("connection", (socket) => {
  //console.log("A user connected:", socket.id);

  // Example: Emit welcome message
  socket.emit("welcome", { message: "Connected to server" });

  // Example: Receive IPO updates
  socket.on("newIPO", (ipoData) => {
    //console.log("New IPO data:", ipoData);
    // Broadcast to all clients except sender
    socket.broadcast.emit("ipoAdded", ipoData);
  });

  // Example: Receive transactions
  socket.on("newTransaction", (transactionData) => {
    //console.log("New Transaction:", transactionData);
    io.emit("transactionAdded", transactionData); // emit to all
  });

  socket.on("disconnect", () => {
    //console.log("User disconnected:", socket.id);
  });
});

///Start server after DB sync
db.sequelize.sync().then(() => {
  server.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
});

