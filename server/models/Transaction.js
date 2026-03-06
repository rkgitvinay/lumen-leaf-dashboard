import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  type: { type: String, enum: ['rent_collected', 'maintenance_expense', 'placement_fee'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'paid' },
  date: { type: Date, required: true },
  description: String,
}, { timestamps: true });

transactionSchema.index({ propertyId: 1, date: -1 });
transactionSchema.index({ date: -1 });

export default mongoose.model('Transaction', transactionSchema);
