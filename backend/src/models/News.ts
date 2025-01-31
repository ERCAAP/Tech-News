import { Schema, model, Document } from 'mongoose';

export interface INews extends Document {
  title: string;          // Haber başlığı
  displayTitle: string;   // Görünen başlık
  content: string;        // İçerik
  summary: string;        // Özet
  author: Schema.Types.ObjectId;
  category: string;
  subCategory?: string;   // Alt kategori
  tags: string[];
  imageUrl?: string;      // Kapak görseli
  contentImages?: string[]; // İçerik görselleri
  videoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;      // Görüntülenme sayısı
  likes: Schema.Types.ObjectId[]; // Beğenenler
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;     // Yayınlanma tarihi
  isHighlighted: boolean; // Öne çıkan haber mi?
  readTime: number;       // Okuma süresi (dakika)
}

const newsSchema = new Schema<INews>({
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'AI', 'App'],
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
  imageUrl: String,
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
  }
}, {
  timestamps: true
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

export const News = model<INews>('News', newsSchema); 