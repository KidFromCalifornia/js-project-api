import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import thoughtsRoutes from "./routes/thoughts.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const port = process.env.PORT || 8088;
const app = express();

app.use(
  cors({
    origin: "*", // Allow all origins for development
  })
);
app.use(express.json());

// Use routesrs
app.use("/thoughts", thoughtsRoutes);
app.use("/", usersRoutes);

// ...any other setup...

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
