import express from "express";
import Thought from "../models/Thought.js";
import authenticationUser from "../middlewares/authenticationUser.js";

const router = express.Router();

router.get("/", (_, res) => {
  Thought.find()
    .then((thoughts) => {
      res.json(thoughts);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});

router.get("/thoughts", async (_, res) => {
  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 }).limit(20);
    res.json(thoughts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/thoughts/:id", async (req, res) => {
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

router.get("/thoughts/hearts/:min", async (req, res) => {
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

router.get("/thoughts/search/:word", async (req, res) => {
  const word = req.params.word.toLowerCase();
  try {
    const filtered = await Thought.find({
      message: { $regex: word, $options: "i" },
    });
    res.json(filtered);
  } catch (err) {
    console.error("Search error:", err); // Add this line
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/thoughts/page/:page", async (req, res) => {
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
router.post("/thoughts", authenticationUser, async (req, res) => {
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

router.post("/thoughts/:id/like", authenticationUser, async (req, res) => {
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

router.delete("/thoughts/:id", authenticationUser, async (req, res) => {
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
router.patch("/thoughts/:id", authenticationUser, async (req, res) => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      req.params.id,
      req.body,
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
export default router;
