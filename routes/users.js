import express from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.password)) {
    res.json({ userId: user._id, accessToken: user.accessToken });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Validate input first!
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    return res.status(400).json({ error: "Username or email already exists" });
  }

  // 2. Only hash and save after validation
  const salt = bcrypt.genSaltSync();
  const user = new User({
    username,
    email,
    password: bcrypt.hashSync(password, salt),
  });
  await user.save();

  res.status(201).json({
    success: true,
    message: "User created successfully",
    userId: user._id,
    accessToken: user.accessToken,
    user,
  });
});
export default router;
