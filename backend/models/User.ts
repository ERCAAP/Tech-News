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