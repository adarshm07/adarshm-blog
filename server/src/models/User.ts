import { Schema, model } from "mongoose";

const userSchema = new Schema({
    id: { type: String },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    isActive: { type: Boolean, default: false }
});

export default model("User", userSchema);
