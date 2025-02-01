const NewsSchema = new Schema({
  // ... diğer alanlar aynı ...
  views: {
    total: { type: Number, default: 0 },
    uniqueUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
}); 