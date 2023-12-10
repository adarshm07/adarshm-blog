import { Schema, model } from "mongoose";

const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true },
    img: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
});

// mongoose.models.Profile ?? mongoose.model('Post', PostSchema);
export const Post = mongoose.models.Post ?? mongoose.model('Post', PostSchema);