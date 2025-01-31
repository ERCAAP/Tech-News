import mongoose from 'mongoose';

export interface INews extends mongoose.Document {
  title: string;          // Haber başlığı
  displayTitle: string;   // Görünen başlık
  coverImage: string;      // Cover image
  content: string;        // İçerik
  summary: string;        // Özet
  author: mongoose.Schema.Types.ObjectId;
  category: string;
  subCategory?: string;   // Alt kategori
  tags: string[];
  imageUrl: string;      // Sadece tek bir image alanı
  contentImages: string[]; 
  videoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;      // Görüntülenme sayısı
  likes: mongoose.Schema.Types.ObjectId[]; // Beğenenler
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;     // Yayınlanma tarihi
  isHighlighted: boolean; // Öne çıkan haber mi?
  readTime: number;       // Okuma süresi (dakika)
}

const newsSchema = new mongoose.Schema<INews>({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur'],
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
    required: [true, 'İçerik zorunludur']
  },
  summary: {
    type: String,
    required: true,
    maxlength: 200
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['TECHNOLOGY', 'AI', 'APP'],
    message: 'Geçersiz kategori seçimi'
  },
  subCategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    get: function(v: any) {
      if (!v) return '';
      return v;
    }
  },
  contentImages: [String],
  videoUrl: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Okuma süresini hesapla (ortalama 200 kelime/dakika)
newsSchema.pre('save', function(next) {
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / 200);
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// İndeksler
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });
newsSchema.index({ category: 1, status: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ viewCount: -1 });

export const News = mongoose.model<INews>('News', newsSchema); 