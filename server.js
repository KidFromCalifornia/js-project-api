import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt-nodejs";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const port = process.env.PORT || 9001;
const app = express();

const authenticationUser = async (req, res, next) => {
  const username = await users.findOne({
    accessToken: req.headers("accesstoken"),
  });
  if (username) {
    req.username = username;
    next();
  } else {
    return res.status(401).json({ loggedout: true, error: "Unauthorized" });
  }
};

const users = mongoose.model("username", {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  acessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
});

app.post("/login", async (req, res) => {
  const user = await users.findOne({
    username: req.body.username,
  });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    // If user exists and password matches
    res.json({ userid: user._id, acessToken: user.acessToken });
  } else {
    // If user does not exist or password does not match
    res.json({ error: "Invalid username or password" });
  }
});

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (_, res) => {
  Thought.find()
    .then((thoughts) => {
      res.json(thoughts);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});
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
});

const Thought = mongoose.model("Thought", thoughtSchema);

if (process.env.RESET_DATABASE) {
  console.log("Resetting database");
  const seedThoughts = async () => {
    await Thought.deleteMany({});
    await new Thought({ message: "This is a test one", hearts: 0 }).save();
    await new Thought({ message: "This is a test two", hearts: 7 }).save();
    await new Thought({ message: "This is a test 3", hearts: 5 }).save();
  };
  seedThoughts();
}

app.get("/thoughts", async (_, res) => {
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

app.get("/thoughts/hearts/:min", async (req, res) => {
  const min = Number(req.params.min);
  if (isNaN(min)) {
    return res
      .status(400)
      .json({ error: "Invalid 'min' parameter. Must be a number." });
  }
  try {
    const filteredThoughts = await Thought.find({ hearts: { $gte: min } });
    res.json(filteredThoughts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/thoughts/search/:word", async (req, res) => {
  const word = req.params.word.toLowerCase();
  try {
    const filtered = await Thought.find({
      message: { $regex: word, $options: "i" },
    });
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
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

app.post("/thoughts", authenticationUser);
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

app.post("/thoughts/:id/like", authenticationUser);
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

app.delete("/thoughts/:id", authenticationUser);
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
// PATCH endpoint to edit a thought
app.patch("/thoughts/:id", authenticationUser, async (req, res) => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      req.params.id,
      req.body, // Only updates the fields sent in the request
      { new: true, runValidators: true }
    );
    if (updatedThought) {
      res.json(updatedThought);
    } else {
      res.status(404).json({ error: "Thought not found" });
    }
  } catch (err) {
    res
      .status(400)
      .json({ error: "Could not update thought", details: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
