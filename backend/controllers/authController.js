const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const admin = require("../firebase/firebaseConfig");

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

exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name } = decoded;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ email, name, isGoogleUser: true });
    }

    const jwtToken = generateToken(user.id);
    res.json({ token: jwtToken, user });
  } catch (err) {
    res.status(500).json({ error: "Invalid Google token" });
  }
};
