import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;  // password'ü optional yaptık
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  favoriteNews: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false  // Varsayılan olarak password'ü getirme
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favoriteNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }]
}, {
  timestamps: true
});

// Şifre hash'leme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password!, 12);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password!);
};

export const User = mongoose.model<IUser>('User', userSchema); 