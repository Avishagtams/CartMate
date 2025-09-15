const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth"); // לבדוק שהנתיב נכון לפי שם התיקייה

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;

    // ולידציה בסיסית + נרמול אימייל
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ msg: "Missing required fields" });
    }
    email = String(email).toLowerCase().trim();

    // בדיקת ייחודיות מייל/טלפון
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ msg: "Email or phone already in use" });
    }

    // הצפנת סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירה ושמירה
    const newUser = await User.create({ name, email, password: hashedPassword, phone });

    return res.status(201).json({
      msg: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing email or password" });
    }
    email = String(email).toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // חשוב: אותו SECRET כמו במידלוור!
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// מי אני (ראוט מוגן)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const me = await User.findById(req.userId).select("-password");
    if (!me) return res.status(404).json({ msg: "User not found" });
    return res.json(me);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/update", requireAuth, async (req, res) => {
  try {
    const userId = req.userId; // מזהה מהטוקן (מוגדר במידלוור)
    let { name, email, phone, password } = req.body;

    // ולידציה בסיסית
    if (!name || !email || !phone) {
      return res.status(400).json({ msg: "Missing required fields" });
    }
    email = String(email).toLowerCase().trim();

    // בניית אובייקט עדכון
    const updateData = { name, email, phone };

    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    return res.json({
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

