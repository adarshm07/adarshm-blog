import { Schema } from "mongoose";

const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    featuredImage: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Post = mongoose.models.Post ?? mongoose.model("Post", PostSchema);
