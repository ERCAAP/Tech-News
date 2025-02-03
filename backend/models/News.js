const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: String,
  videoUrl: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'AI', 'App Development', 'Cyber Security', 'General']
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favoriteCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  contentImages: [String]
});

// Görüntülenme sayısını artır
newsSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// Favorilere ekle
newsSchema.methods.addToFavorites = async function(userId) {
  if (!this.favorites.includes(userId)) {
    this.favorites.push(userId);
    this.favoriteCount = this.favorites.length;
    await this.save();
  }
  return this;
};

// Favorilerden çıkar
newsSchema.methods.removeFromFavorites = async function(userId) {
  this.favorites = this.favorites.filter(id => !id.equals(userId));
  this.favoriteCount = this.favorites.length;
  await this.save();
  return this;
};

module.exports = mongoose.model('News', newsSchema); 