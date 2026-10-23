const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const admin = require("../firebase/firebaseConfig");
const { Op } = require("sequelize");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.password)
      return res.status(400).json({ msg: "Google user. Use Google login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// exports.googleLogin = async (req, res) => {
//   const { token: idToken } = req.body;

//   if (!idToken) {
//     return res.status(400).json({
//       msg: "Google token is required"
//     });
//   }

//   try {
//     console.log("🚀 Google login request received");

//     console.time("🔥 Firebase verification");
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     console.timeEnd("🔥 Firebase verification");

//     const { uid, email, name } = decoded;

//     if (!email) {
//       return res.status(400).json({
//         msg: "Google account has no email"
//       });
//     }

//     // IMPORTANT: define it here
//     const normalizedEmail = email.toLowerCase().trim();

//     console.time("🗄️ Database lookup");

//     let user = await User.findOne({
//       where: { firebaseUid: uid }
//     });

//     if (!user) {
//       user = await User.findOne({
//         where: { email: normalizedEmail }
//       });
//     }

//     console.timeEnd("🗄️ Database lookup");

//     if (!user) {
//       user = await User.create({
//         firebaseUid: uid,
//         email: normalizedEmail,
//         name: name || "User",
//         isGoogleUser: true
//       });
//     } else if (!user.firebaseUid) {
//       user.firebaseUid = uid;
//       user.isGoogleUser = true;
//       await user.save();
//     }

//     const jwtToken = generateToken(user.id);

//     const safeUser = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       isGoogleUser: user.isGoogleUser
//     };

//     return res.status(200).json({
//       token: jwtToken,
//       user: safeUser
//     });

//   } catch (err) {
//     console.error("❌ Google authentication error");
//   console.error("Code:", err.code);
//   console.error("Message:", err.message);
//   console.error("Error info:", err.errorInfo);
//   console.error("Stack:", err.stack);

//   return res.status(401).json({
//     msg: "Invalid Google token"
//   });
//   }
// };

exports.googleLogin = async (req, res) => {
  const { token: idToken } = req.body;
  if (!idToken) return res.status(400).json({ msg: "Google token is required" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decoded;
    if (!email) return res.status(400).json({ msg: "Google account has no email" });

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      where: { [Op.or]: [{ firebaseUid: uid }, { email: normalizedEmail }] },
    });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: normalizedEmail,
        name: name || "User",
        isGoogleUser: true,
      });
    } else if (!user.firebaseUid) {
      user.firebaseUid = uid;
      user.isGoogleUser = true;
      await user.save();
    }

    return res.status(200).json({
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, isGoogleUser: user.isGoogleUser },
    });
  } catch (err) {
    console.error("Google authentication error:", err.code, err.message);
    return res.status(401).json({ msg: "Invalid Google token" });
  }
};