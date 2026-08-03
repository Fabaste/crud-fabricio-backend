import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // 900 segundos = 15 minutos. MongoDB borrará este documento automáticamente.
  },
});

export const Verification = mongoose.model('Verification', verificationSchema);