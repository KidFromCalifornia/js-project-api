import mongoose from "mongoose";

const thoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    trim: true,
    required: true,
    minlength: 5,
    maxlength: 140,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Thought = mongoose.model("Thought", thoughtSchema);

export default Thought;
