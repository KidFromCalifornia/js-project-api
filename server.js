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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
