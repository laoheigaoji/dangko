import mongoose from "mongoose";

export interface IUser {
  _id?: string;
  phone: string;
  email?: string;
  wx?: string;
  qq?: string;
  password?: string;
  isVip: boolean;
  favorites: string[]; // item IDs
  subscriptions: { shopName: string; turnover: boolean; buy: boolean }[];
  createdAt: Date;
}

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  wx: { type: String },
  qq: { type: String },
  isVip: { type: Boolean, default: false },
  favorites: { type: [String], default: [] },
  subscriptions: [{
    shopName: String,
    turnover: { type: Boolean, default: true },
    buy: { type: Boolean, default: true }
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
