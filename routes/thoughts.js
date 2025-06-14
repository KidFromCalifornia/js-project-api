import express from "express";
import Thought from "../models/Thought.js";
import authenticationUser from "../middlewares/authenticationUser.js";

const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 }).limit(20);
    res.json(thoughts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search/:word", async (req, res) => {
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

router.get("/hearts/:min", async (req, res) => {
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

router.get("/page/:page", async (req, res) => {
  const page = Number(req.params.page);
  const pageSize = 5;
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

router.get("/:id", async (req, res) => {
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
/////////////////
// post routes //
/////////////////

router.post("/", authenticationUser, async (req, res) => {
  const { message, hearts } = req.body;
  try {
    const newThought = await Thought.create({
      message,
      hearts: hearts || 0,
      username: req.user.username,
    });
    res.status(201).json(newThought);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Could not create thought", details: err.message });
  }
});

router.post("/:id/like", authenticationUser, async (req, res) => {
  try {
    const addHearts = await Thought.findByIdAndUpdate(
      req.params.id,
      { $inc: { hearts: 1 } },
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

////////////////////
// Delete routes ///
////////////////////

router.delete("/:id", authenticationUser, async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      return res.status(404).json({ error: "Thought not found" });
    }
    if (thought.username !== req.user.username) {
      // <--- Compare username
      return res
        .status(403)
        .json({ error: "You can only delete your own thoughts" });
    }
    await thought.deleteOne();
    res.json({ success: true, deleted: thought });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});
//////////////////
// Patch routes //
//////////////////

router.patch("/:id", authenticationUser, async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      return res.status(404).json({ error: "Thought not found" });
    }
    if (thought.username !== req.user.username) {
      return res
        .status(403)
        .json({ error: "You can only edit your own thoughts" });
    }
    const updatedThought = await Thought.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, thought: updatedThought });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Could not update thought", details: err.message });
  }
});

//if (process.env.RESET_DATABASE) {
// console.log("Resetting database");
//const seedThoughts = async () => {
//await Thought.deleteMany({});
//await new Thought({ message: "This is a test one", hearts: 0 }).save();
//await new Thought({ message: "This is a test two", hearts: 7 }).save();
//await new Thought({ message: "This is a test 3", hearts: 5 }).save();
//};
//seedThoughts();
//}

export default router;
