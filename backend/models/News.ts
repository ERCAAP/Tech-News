import mongoose, { Schema, Document } from 'mongoose';

interface INews extends Document {
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  category: string;
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  readTime?: number;
  views: {
    total: number;
    unique: number;
    last24Hours: number;
    history: {
      userId: mongoose.Types.ObjectId;
      timestamp: Date;
    }[];
  };
  shareCount: number;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const NewsSchema = new Schema({
  title: { type: String, required: true },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },
  content: { type: String, required: true },
  imageUrl: { type: String },
  category: {
    type: String,
    required: [true, 'Kategori gereklidir'],
    enum: ['app-development', 'artificial-intelligence', 'technology'],
    set: (value: string) => value.toLowerCase().replace(/\s+/g, '-')
  },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  tags: [String],
  readTime: { type: Number }, // Dakika cinsinden okuma süresi
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    last24Hours: { type: Number, default: 0 },
    history: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  shareCount: { type: Number, default: 0 },
  url: { type: String }, // Dış kaynak URL'si (varsa)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  publishedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Slug oluşturma middleware'i
NewsSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Okuma süresini hesapla (ortalama 200 kelime/dakika)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  // Kategoriyi küçük harfe çevir ve boşlukları tire ile değiştir
  if (this.isModified('category')) {
    // Kategori zaten schema'da set edildiği için burada tekrar dönüştürmeye gerek yok
  }

  next();
});

// Pre-update middleware ekleyelim
NewsSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update.category) {
    update.category = update.category.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// URL oluşturma için virtual field
NewsSchema.virtual('fullUrl').get(function() {
  return `/news/${this.slug}`;
});

// Popülerlik skoru hesaplama için virtual field
NewsSchema.virtual('popularityScore').get(function() {
  const viewWeight = 1;
  const shareWeight = 2;
  
  return (
    (this.views?.total || 0) * viewWeight +
    (this.shareCount || 0) * shareWeight
  );
});

export const News = mongoose.model<INews>('News', NewsSchema); 