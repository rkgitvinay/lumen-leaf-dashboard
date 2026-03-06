import mongoose from 'mongoose';

const monthlyEarningSchema = new mongoose.Schema({
  month: String,
  amount: Number,
}, { _id: false });

const brokerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  area: String,
  partnerModel: { type: String, enum: ['revenue_share', 'referral', 'area_partner'] },
  propertiesReferred: { type: Number, default: 0 },
  revenueSharePercent: { type: Number, default: 25 },
  monthlyEarnings: [monthlyEarningSchema],
  joinedAt: Date,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Broker', brokerSchema);
