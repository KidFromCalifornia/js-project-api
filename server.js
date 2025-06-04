import cors from "cors";
import express from "express";

import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start

const port = process.env.PORT || 9000;
0;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  Thought.find()
    .then((thoughts) => {
      res.json(thoughts);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});

const Thought = mongoose.model("Thought", {
  message: {
    type: mongoose.Schema.Types.String,
    trim: true,
    ref: "Thought",
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
});

if (process.env.RESET_DATABASE) {
  console.log("Resetting database");

  const seedThoughts = async () => {
    new Thought({
      message: "This is a test one",
      hearts: 0,
    }).save();
    new Thought({
      message: "This is a test two",
      hearts: 7,
    }).save();
    new Thought({
      message: "This is a test 3",
      hearts: 5,
    }).save();
  };
}

app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 }).limit(20);
    res.json(thoughts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/thoughts/:id", async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (thought) {
      res.json(thought);
    } else {
      res.status(404).json({ error: "Thought not found" });
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

app.get("/thoughts/hearts/:min", (req, res) => {
  const min = Number(req.params.min);
  if (isNaN(min)) {
    return res
      .status(400)
      .json({ error: "Invalid 'min' parameter. Must be a number." });
  }
  const filteredThoughts = thoughts.filter(
    (t) => typeof t.hearts === "number" && t.hearts >= min
  );
  res.json(filteredThoughts);
});

app.get("/thoughts/search/:word", (req, res) => {
  const word = req.params.word.toLowerCase();
  const filtered = thoughts.filter(
    (t) =>
      typeof t.message === "string" && t.message.toLowerCase().includes(word)
  );
  res.json(filtered);
});

app.get("/thoughts/page/:page", async (req, res) => {
  const page = Number(req.params.page);
  const pageSize = 5; // Number of thoughts per page

  if (!Number.isInteger(page) || page <= 0) {
    return res.status(400).json({ error: "Page must 1 or more " });
  }

  try {
    const thoughts = await Thought.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json(thoughts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/thoughts", async (req, res) => {
  const { message, hearts } = req.body;
  try {
    const newThought = await Thought.create({
      message,
      hearts: hearts || 0,
    });
    res.status(201).json(newThought);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Could not create thought", details: err.message });
  }
});
app.post("/thoughts/:id/like", async (req, res) => {
  try {
    const addHearts = await Thought.findByIdAndUpdate(
      req.params.id,
      { $inc: { hearts: 1 } }, // Increment hearts by 1
      { new: true }
    );
    if (addHearts) {
      res.json(addHearts);
    } else {
      res.status(404).json({ error: "Thought not found" });
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

app.delete("/thoughts/:id", async (req, res) => {
  try {
    const deleted = await Thought.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ success: true, deleted });
    } else {
      res.status(404).json({ error: "Thought not found" });
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
