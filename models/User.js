import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
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
    default: () => crypto.randomBytes(37).toString("hex"),
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
