import mongoose, { Schema, Types } from "mongoose";

interface UserAttributes {
    _id: { type: Types.ObjectId },
    name: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
}

const UserSchema = new Schema<UserAttributes>({
    _id: { type: Types.ObjectId },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ["ADMIN", "USER", "MODERATOR", "CONTENT-WRITER"], default: "USER" },
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

export const User = mongoose.models.User ?? mongoose.model('User', UserSchema);