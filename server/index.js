import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
const app = express();
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

import path from "path";
const __dirname = path.resolve();

// Routes
import AuthRoute from "./routes/auth.routes.js";
import PostRoute from "./routes/post.routes.js";

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
  });
});

app.use("/auth", AuthRoute);
app.use("/posts", PostRoute);

const DB_CONNECT = process.env.DB_CONNECT;
const PORT = process.env.PORT || 4000;
mongoose
  .connect(DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(PORT, () => console.log("Server connected.")))
  .catch((error) => console.log(error.message));
