import mongoose, { Schema, Types } from "mongoose";

interface PostAttributes {
    // _id: { type: Types.ObjectId };
    title: string;
    content: string;
    slug: string;
    // category: Types.ObjectId;
    author: {
        type: Types.ObjectId,
        ref: 'User'
    };
}

const PostSchema = new Schema({
    // _id: { type: Types.ObjectId },
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true },
    author: { type: Types.ObjectId, ref: 'User' }
    // category: { type: Schema.Types.ObjectId, ref: "Category" }
}, { timestamps: true });

export const Post = mongoose.models.Post ?? mongoose.model("Post", PostSchema);