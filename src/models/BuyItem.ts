import mongoose, { Document, Schema } from 'mongoose';

export interface IBuyItem extends Document {
  shopName: string;
  requestAmount: number;
  userName: string;
  remark?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  wx?: string;
  qq?: string;
  phone?: string;
}

const BuyItemSchema = new Schema({
  shopName: { type: String, required: true },
  requestAmount: { type: Number, required: true },
  userName: { type: String, required: true },
  remark: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  wx: { type: String },
  qq: { type: String },
  phone: { type: String },
});

export default mongoose.models.BuyItem || mongoose.model<IBuyItem>('BuyItem', BuyItemSchema);
