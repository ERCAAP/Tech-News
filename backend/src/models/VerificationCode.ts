import mongoose from 'mongoose';

interface IVerificationCode {
  email: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
}

const verificationCodeSchema = new mongoose.Schema<IVerificationCode>({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 dakika
  },
  isUsed: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

// Otomatik temizleme için index
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCode = mongoose.model<IVerificationCode>('VerificationCode', verificationCodeSchema); 