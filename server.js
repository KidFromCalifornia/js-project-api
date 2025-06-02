import cors from "cors";
import express from "express";
import thoughts from "./data.json";

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
  res.send("I did it!");
});

app.get("/thoughts", (req, res) => {
  res.json(thoughts);
});

app.get("/thoughts/:id", (req, res) => {
  const { id } = req.params;
  const thought = thoughts.find((t) => t._id === id);
  if (thought) {
    res.json(thought);
  } else {
    res.status(404).json({ error: "Thought not found" });
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

app.get("/thoughts/page/:page", (req, res) => {
  const page = Number(req.params.page);
  if (!Number.isInteger(page) || page <= 0) {
    return res.status(400).json({ error: "Page must be a positive integer." });
  }
  const pageSize = 5; // Number of thoughts per page
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedThoughts = thoughts.slice(start, end);
  res.json(pagedThoughts);
});

app.post("/thoughts", (req, res) => {
  const { message, hearts } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (hearts !== undefined && (typeof hearts !== "number" || isNaN(hearts))) {
    return res.status(400).json({ error: "Hearts must be a valid number" });
  }
  const newThought = {
    _id: Date.now().toString(),
    message,
    hearts: hearts || 0,
    createdAt: new Date().toISOString(),
    __v: 0,
  };
  thoughts.push(newThought);
  res.status(201).json(newThought);
});

app.delete("/thoughts/:id", (req, res) => {
  const { id } = req.params;
  const index = thoughts.findIndex((t) => t._id === id);
  if (index !== -1) {
    const deleted = thoughts.splice(index, 1);
    res.json({ success: true, deleted: deleted[0] });
  } else {
    res.status(404).json({ error: "Thought not found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
