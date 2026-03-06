import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  category: { type: String, enum: ['plumbing', 'electrical', 'appliance', 'painting', 'carpentry', 'cleaning'], required: true },
  priority: { type: String, enum: ['emergency', 'high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  description: String,
  vendor: String,
  cost: { type: Number, default: 0 },
  responseTimeHrs: Number,
  resolvedAt: Date,
}, { timestamps: true });

maintenanceSchema.index({ propertyId: 1 });
maintenanceSchema.index({ status: 1 });

export default mongoose.model('Maintenance', maintenanceSchema);
