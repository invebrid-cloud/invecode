import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET)
    // console.log(decoded);

    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "admins") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export { authenticate, authorizeAdmin };