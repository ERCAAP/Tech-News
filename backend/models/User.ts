import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  userId: string;
  email: string;
  name: string;
  password?: string;
  role: 'user' | 'admin';
  preferences?: {
    categories: string[];
    notificationSettings: {
      newArticles: boolean;
      newsletter: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  readingHistory: Array<{
    news: mongoose.Types.ObjectId;
    readAt: Date;
    completedReading: boolean;
  }>;
  isSubscription: boolean;
  subscriptionPlan?: 'monthly' | 'yearly' | null;
  subscriptionEndDate?: Date;
  favoriteNews: mongoose.Types.ObjectId[];
}

interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const UserSchema = new Schema<IUserDocument>({
  userId: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: [true, 'Email adresi gereklidir'],
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  readingHistory: [{
    news: { type: Schema.Types.ObjectId, ref: 'News' },
    readAt: { type: Date, default: Date.now },
    completedReading: { type: Boolean, default: false }
  }],
  isSubscription: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: String,
    enum: ['monthly', 'yearly', null],
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  favoriteNews: [{
    type: Schema.Types.ObjectId,
    ref: 'News'
  }],
  preferences: {
    categories: [{ type: String }],
    notificationSettings: {
      newArticles: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
  }
}, {
  timestamps: true
});

// Şifre hash'leme middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
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

UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

export const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema); 