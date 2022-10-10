import express from "express";
const router = express.Router();

import { register, login, logout, session } from "../controllers/auth.js";
import { verifyToken } from "../utils/verifyToken.js";

// Register POST Request.
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", verifyToken, session);

export default router;
