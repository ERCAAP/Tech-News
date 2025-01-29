import { Schema, model, Document } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  summary: string;
  author: Schema.Types.ObjectId;
  category: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<INews>({
  title: {
    type: String,
    required: [true, 'A news must have a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'A news must have content']
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
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Full-text search indexes
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });

export const News = model<INews>('News', newsSchema); 