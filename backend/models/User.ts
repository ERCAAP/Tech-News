import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  role: string;
  readingHistory: Array<{
    news: mongoose.Types.ObjectId;
    readAt: Date;
    completedReading: boolean;
  }>;
  preferences: {
    categories: string[];
    notificationSettings: {
      newArticles: boolean;
      newsletter: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  provider: string;
  providerId: string;
  isEmailVerified: boolean;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email adresi gereklidir'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: 6,
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'Ad gereklidir'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyad gereklidir'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  readingHistory: [{
    news: { type: Schema.Types.ObjectId, ref: 'News' },
    readAt: { type: Date, default: Date.now },
    completedReading: { type: Boolean, default: false }
  }],
  preferences: {
    categories: [String],
    notificationSettings: {
      newArticles: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'apple'],
    default: 'local'
  },
  providerId: {
    type: String,
    sparse: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Şifre hash'leme middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Şifre karşılaştırma metodu
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password) return false;
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('Password compare error:', error);
    return false;
  }
};

export const User = mongoose.model<IUser>('User', UserSchema); 