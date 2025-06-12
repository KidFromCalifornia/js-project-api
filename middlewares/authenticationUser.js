import User from "../models/User.js";

const authenticationUser = async (req, res, next) => {
  const accessToken = req.headers["accesstoken"];
  if (!accessToken) {
    return res.status(401).json({ error: "Access token required" });
  }
  const user = await User.findOne({ accessToken });
  if (user) {
    req.user = user;
    next();
  } else {
    return res.status(401).json({ loggedout: true, error: "Unauthorized" });
  }
};

export default authenticationUser;
