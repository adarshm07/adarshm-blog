import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// Routes
import AuthRoute from "./routes/auth.routes.js";
import PostRoute from "./routes/post.routes.js";

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// app.use(cors({ origin: true, credentials: true }));
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ data: "This is index.js" });
});

app.use("/auth", AuthRoute);
app.use("/posts", PostRoute);

const DB_CONNECT = process.env.DB_CONNECT;
const PORT = process.env.PORT || 4000;
mongoose
  .connect(DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log("Server connected.")))
  .catch((error) => console.log(error.message));
