import User from "../models/User.js";

const authenticationUser = async (req, res, next) => {
  try {
    const authHeader = req.headers && req.headers.authorization;
    const accessToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    if (!accessToken) {
      return res.status(401).json({ error: "Access token required" });
    }
    const user = await User.findOne({ accessToken });
    if (user) {
      req.user = user;
      return next();
    } else {
      return res.status(401).json({ loggedout: true, error: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default authenticationUser;
