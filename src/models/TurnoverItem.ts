import mongoose, { Document, Schema } from 'mongoose';

export interface ITurnoverItem extends Document {
  shopName: string;
  originalPrice: number;
  transferPrice: number;
  userName: string;
  description?: string;
  views: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  wx?: string;
  qq?: string;
  phone?: string;
}

const TurnoverItemSchema = new Schema({
  shopName: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  transferPrice: { type: Number, required: true },
  userName: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  wx: { type: String },
  qq: { type: String },
  phone: { type: String },
});

export default mongoose.models.TurnoverItem || mongoose.model<ITurnoverItem>('TurnoverItem', TurnoverItemSchema);
