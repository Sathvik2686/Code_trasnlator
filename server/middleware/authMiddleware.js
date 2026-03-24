import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No or invalid token format"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid token payload"
      });
    }

    // ✅ FIXED STRUCTURE
    req.user = { id: decoded.id };

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message); // 🔥 DEBUG

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

export default authMiddleware;