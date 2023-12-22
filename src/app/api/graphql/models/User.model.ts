import mongoose, { Schema } from "mongoose";

interface UserAttributes {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: string;
    isActive: boolean;
}

const UserSchema = new Schema<UserAttributes>({
    id: { type: String },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["ADMIN", "USER", "MODERATOR", "CONTENT-WRITER"], default: "USER" },
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

export const User = mongoose.models.User ?? mongoose.model('User', UserSchema);
