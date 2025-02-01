import mongoose, { Schema, Document } from 'mongoose';

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
}

const UserSchema = new Schema({
  // ... diğer alanlar ...
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
});

export const User = mongoose.model<IUser>('User', UserSchema); 