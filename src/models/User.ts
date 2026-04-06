// models/user.ts
import mongoose, { Schema, Model, Types, HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "user" | "instructor" | "admin";

export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  verificationTokenPurpose?: "signup" | "password-reset";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    verificationTokenPurpose: { type: String, enum: ["signup", "password-reset"] },
  },
  { timestamps: true }
);

// ✅ TTL Index: delete users 24 hours after creation if not verified
UserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400, // 24 hours = 60 * 60 * 24
    partialFilterExpression: { emailVerified: false },
  }
);

// Pre-save hook to hash password if it's new or modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: UserModel =
  (mongoose.models.User as UserModel) || mongoose.model<IUser, UserModel>("User", UserSchema);
