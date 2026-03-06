import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  name: String,
  address: String,
  area: { type: String, enum: ['Gurgaon', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad'] },
  type: { type: String, enum: ['1BHK', '2BHK', '3BHK'] },
  sizeSqft: Number,
  monthlyRent: Number,
  securityDeposit: Number,
  status: { type: String, enum: ['occupied', 'vacant', 'maintenance'], default: 'occupied' },
  ownerName: String,
  ownerPhone: String,
  ownerEmail: String,
  ownerType: { type: String, enum: ['NRI', 'Investor', 'Professional', 'Senior Citizen'] },
  tenantName: String,
  tenantPhone: String,
  tenantEmail: String,
  moveInDate: Date,
  leaseEnd: Date,
  verificationStatus: { type: String, enum: ['verified', 'pending', 'not_started'], default: 'verified' },
  managedSince: Date,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Broker', default: null },
}, { timestamps: true });

export default mongoose.model('Property', propertySchema);
