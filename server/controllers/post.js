import Post from "../models/Post.js";
import User from "../models/User.js";
import { listAllImages, upload } from "../utils/awsUtil.js";

export const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find().populate("author");
    if (!allPosts.length) res.status(400).json("No Posts.");
    const arr = [];
    allPosts.forEach((item) => {
      let featuredImg = item.description?.match(/(?<=<img src=").*?(?=")/gm);
      const data = {
        id: item._id,
        title: item.title,
        description: item.metaDescription,
        author: item.author.name,
        status: item.status,
        updatedDate: item.updatedDate,
        slug: item.slug,
        featuredImg,
      };
      arr.push(data);
    });

    res.status(200).json(arr);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const id = req.params.id;
    const myPosts = await Post.find({ author: id });
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
    const post = await Post.findOne({ slug: slug });
    // if (!post) res.status(400).json("Post not found");
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json("Post not found");
  }
};

export const editPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug }).populate("author");
    if (!post) res.status(400).json("Post not found");
    if (post) res.status(200).json(post);
  } catch (error) {
    res.status(400).json("Post not found");
  }
};

export const publishPost = async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
    });

    const post = await newPost.save();
    res.status(200).json({ status: "Success", post_id: post._id });
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

export const uploadImage = async (req, res, next) => {
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
};

export const fetchImages = async (req, res) => {
  const data = await listAllImages();
  if (!data) {
    res.status(400).json({ message: "No files" });
  }
  res.status(200).json({ data: data });
};
