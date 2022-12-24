import mongoose, { Schema } from "mongoose";

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  categories: {
    type: [String],
    ref: "Category",
  },
  status: {
    type: String,
    enum: ["PUBLISH", "DRAFT", "TRASH"],
    default: "DRAFT",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  metaTitle: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  updatedDate: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("Post", PostSchema);
