require("dotenv").config(); // חייב בראש הקובץ

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./Routes/auth"); // ודאי ששם התיקייה תואם

const app = express();
app.use(cors());
app.use(express.json());

// חיבור למסד
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🚀"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// בדיקת סרוור
app.get("/", (req, res) => res.send("Server is running 🚀"));

// ראוטים
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
