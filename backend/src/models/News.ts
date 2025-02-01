import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INews extends Document {
  title: string;          // Haber başlığı
  displayTitle: string;   // Görünen başlık
  coverImage: string;      // Cover image
  content: string;        // İçerik
  summary: string;        // Özet
  author: mongoose.Types.ObjectId;
  category: string;
  subCategory?: string;   // Alt kategori
  tags: string[];
  imageUrl?: string;      // Sadece tek bir image alanı
  contentImages: string[]; 
  videoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;      // Görüntülenme sayısı
  likes: mongoose.Types.ObjectId[]; // Beğenenler
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;     // Yayınlanma tarihi
  isHighlighted: boolean; // Öne çıkan haber mi?
  readTime: number;       // Okuma süresi (dakika)
  views: number;
  favorites: Types.ObjectId[];
  favoriteCount: number;
  // Model metodları
  addToFavorites(userId: mongoose.Types.ObjectId): Promise<INews>;
  removeFromFavorites(userId: mongoose.Types.ObjectId): Promise<INews>;
  incrementViews(): Promise<INews>;
}

const newsSchema = new Schema<INews>({
  title: {
    type: String,
    required: [true, 'Haber başlığı gereklidir'],
    trim: true
  },
  displayTitle: {
    type: String,
    default: function(this: INews) {
      return this.title;
    }
  },
  coverImage: {
    type: String
  },
  content: {
    type: String,
    required: [true, 'Haber içeriği gereklidir']
  },
  summary: {
    type: String,
    required: [true, 'Haber özeti gereklidir'],
    maxlength: [200, 'Özet en fazla 200 karakter olabilir']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Yazar bilgisi gereklidir']
  },
  category: {
    type: String,
    required: [true, 'Kategori gereklidir'],
    enum: {
      values: ['TECHNOLOGY', 'AI', 'APP_DEVELOPMENT', 'CYBER_SECURITY', 'GENERAL'],
      message: '{VALUE} geçerli bir kategori değildir'
    },
    uppercase: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: String,
  contentImages: [String],
  videoUrl: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  publishedAt: {
    type: Date
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  favoriteCount: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Okuma süresini hesapla (ortalama 200 kelime/dakika)
newsSchema.pre('save', function(next) {
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / 200);
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  
  if (this.isModified('favorites')) {
    this.favoriteCount = this.favorites.length;
  }
  
  next();
});

// İndeksler
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });
newsSchema.index({ category: 1, status: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ viewCount: -1 });

// Görüntülenme sayısını artır
newsSchema.methods.incrementViews = async function(this: INews): Promise<INews> {
  this.views += 1;
  await this.save();
  return this;
};

// Favorilere ekle
newsSchema.methods.addToFavorites = async function(this: INews, userId: mongoose.Types.ObjectId): Promise<INews> {
  if (!this.favorites.includes(userId)) {
    this.favorites.push(userId);
    this.favoriteCount = this.favorites.length;
    await this.save();
  }
  return this;
};

// Favorilerden çıkar
newsSchema.methods.removeFromFavorites = async function(this: INews, userId: mongoose.Types.ObjectId): Promise<INews> {
  this.favorites = this.favorites.filter(id => !id.equals(userId));
  this.favoriteCount = this.favorites.length;
  await this.save();
  return this;
};

export const News = mongoose.model<INews>('News', newsSchema); 