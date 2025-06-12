import mongoose from "mongoose";
import crypto from "crypto";

const User = mongoose.model("User", {
  username: {
    type: String,
    required: true,
    unique: true,
    index: true, // Add index for optimization
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true, // Add index for optimization
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
});

export default User;
