import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  role: string;
  favorites: Array<{
    news: mongoose.Types.ObjectId;
    addedAt: Date;
  }>;
  readingHistory: Array<{
    news: mongoose.Types.ObjectId;
    readAt: Date;
    completedReading: boolean;
  }>;
  preferences: {
    categories: string[];
    notificationSettings: {
      newArticles: boolean;
      favorites: boolean;
      newsletter: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  favoriteNews: Array<mongoose.Types.ObjectId>;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favoriteNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  favorites: [{
    news: { type: Schema.Types.ObjectId, ref: 'News' },
    addedAt: { type: Date, default: Date.now }
  }],
  readingHistory: [{
    news: { type: Schema.Types.ObjectId, ref: 'News' },
    readAt: { type: Date, default: Date.now },
    completedReading: { type: Boolean, default: false }
  }],
  preferences: {
    categories: [String],
    notificationSettings: {
      newArticles: { type: Boolean, default: true },
      favorites: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
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

export const User = mongoose.model<IUser>('User', UserSchema); 