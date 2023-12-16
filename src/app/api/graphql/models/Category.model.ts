import { Schema } from "mongoose";

const CategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true },
    featuredImage: { type: String },
}, { timestamps: true });

export const Post = mongoose.models.Post ?? mongoose.model("Category", CategorySchema);
