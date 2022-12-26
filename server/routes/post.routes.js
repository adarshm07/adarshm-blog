import express from "express";
const router = express.Router();

import {
  deletePost,
  editPost,
  getAllAuthors,
  getAllPosts,
  getPost,
  getPostsByUser,
  publishPost,
  statusUpdate,
  updatePost,
} from "../controllers/post.js";
import { upload } from "../utils/awsUtil.js";
import { verifyToken } from "../utils/verifyToken.js";

router.get("/allposts", getAllPosts);
router.get("/getpost/:slug", getPost);
router.get("/getAllAuthors", getAllAuthors);
// protected routes
router.get("/my-posts/:id", verifyToken, getPostsByUser);
router.get("/edit-post/:slug", verifyToken, editPost);
router.post("/publish", verifyToken, publishPost);
router.patch("/update/:id", verifyToken, updatePost);
router.patch("/status/:id", verifyToken, statusUpdate);
router.delete("/delete/:id", verifyToken, deletePost);

// image upload
router.post("/upload", async (req, res, next) => {
  const base64Image = req.body.image;
  const imageName = req.body.imageName;
  const type = req.body.type;

  //   console.log(req.body);
  let response;

  try {
    response = await upload(imageName, base64Image);
  } catch (err) {
    console.error(`Error uploading image: ${err.message}`);
    return next(new Error(`Error uploading image: ${imageName}`));
  }

  res.send({ link: response });
});

export default router;
