import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { createClient } from "redis";
const app = express();
import rateLimit from "express-rate-limit";

// Routes
import AuthRoute from "./routes/auth.routes.js";
import PostRoute from "./routes/post.routes.js";

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// enableCORS(app);

// function enableCORS(expressInstance) {
//   expressInstance.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Credentials", true);
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization, timeZone"
//     );
//     res.header(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT, DELETE, OPTIONS,PATCH"
//     );
//     next();
//   });
// }

app.use(cors());

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (request, response, next, options) =>
    response.status(options.statusCode).send(options.message),
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({ data: "This is index.js" });
});

app.use("/auth", AuthRoute);
app.use("/posts", PostRoute);

// env variables
const DB_CONNECT = process.env.DB_CONNECT;
const PORT = process.env.PORT || 4000;
// const REDIS_PORT = process.env.REDIS_PORT || 6379;

// redis server
// const client = createClient(REDIS_PORT);
// client.on("error", (err) => console.log("Redis Client Error", err.message));
// await client.connect();

mongoose
  .connect(DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log("Server connected.")))
  .catch((error) => console.log(error.message));
