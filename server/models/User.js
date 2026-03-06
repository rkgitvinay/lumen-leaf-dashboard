import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['admin', 'viewer'], default: 'admin' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
