import Post from "../models/Post.js";
import User from "../models/User.js";

export const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find().populate("author");
    if (!allPosts.length) res.status(400).json("No Posts.");
    res.status(200).json(allPosts);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const id = req.params.id;
    const myPosts = await Post.find({
      author: { $elemMatch: { $eq: id } },
    }).populate("author");
    res.status(200).json(myPosts);
  } catch (error) {
    res.status(400).json("No data.");
  }
};

export const getAllAuthors = async (req, res) => {
  try {
    const authors = await User.find();
    res.status(200).json(authors);
  } catch (error) {
    res.status(400).json("No data.");
  }
};

export const getPost = async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await Post.findOne({ slug });
    if (!post) res.status(400).json("Post not found");
  } catch (error) {
    res.status(400).json("Post not found");
  }
};

export const editPost = async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await Post.findOne({ slug });
    if (!post) res.status(400).json("Post not found");
  } catch (error) {
    res.status(400).json("Post not found");
  }
};

export const publishPost = async (req, res) => {
  // console.log(req.body);
  try {
    const newPost = new Post({
      ...req.body,
    });

    await newPost.save();
    res.status(200).json("Posted.");
  } catch (error) {
    res.status(400).json(error);
  }
};

export const updatePost = async (req, res) => {
  try {
    const id = req.params.id;
    await Post.findByIdAndUpdate({ _id: id }, req.body);
    res.status(200).json(updatePost);
  } catch (error) {
    res.status(400).json("Post not updated.");
  }
};

export const statusUpdate = async (req, res) => {
  try {
    const id = req.params.id;
    await Post.findByIdAndUpdate(id, req.body);
    res.status(200).json(req.body);
  } catch (error) {
    res.status(400).json("Post not saved.");
  }
};

export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    await Post.findByIdAndDelete(id);
    res.status(200).json("Post is deleted.");
  } catch (error) {
    res.status(400).json("Post not deleted.");
  }
};
