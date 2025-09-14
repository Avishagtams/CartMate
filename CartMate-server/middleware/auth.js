const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // בלי "SECRET_KEY"
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("JWT verify error:", err.name, err.message);
    res.status(401).json({
      msg: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
    });
  }
};
