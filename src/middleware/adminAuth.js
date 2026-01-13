import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(tokenDecode.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied. Admins only." });
    }

    req.user = user; 
    req.userId = tokenDecode.id;
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

export default adminAuth;