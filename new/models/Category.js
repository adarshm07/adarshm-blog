import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  category: {
    type: [String],
    default: "Uncategorised",
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

export default mongoose.model("Category", CategorySchema);
