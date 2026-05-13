import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: String, required: true },
  type: { type: String, enum: ["roi", "publish", "vip"], default: "publish" },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  outTradeNo: { type: String, unique: true, required: true },
  tradeNo: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
