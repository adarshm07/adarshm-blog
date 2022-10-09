import express from "express";
const router = express.Router();

import { deletePost, editPost, getAllAuthors, getAllPosts, getPost, getPostsByUser, publishPost, statusUpdate, updatePost } from "../controllers/post.js";
import { verifyToken } from "../utils/verifyToken.js";

router.get("/allposts", getAllPosts);
router.get("/getpost", getPost);
router.get("/getAllAuthors", getAllAuthors);
// protected routes
router.get("/my-posts/:id", verifyToken, getPostsByUser);
router.get("/edit-post/:id", verifyToken, editPost);
router.post("/publish", verifyToken, publishPost);
router.patch("/update/:id", verifyToken, updatePost);
router.patch("/status/:id", verifyToken, statusUpdate);
router.delete("/delete/:id", verifyToken, deletePost);

export default router;
