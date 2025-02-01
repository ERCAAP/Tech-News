import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-news';

// User Schema'sını burada tanımlayalım
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email adresi gereklidir'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: 6
  },
  firstName: {
    type: String,
    required: [true, 'Ad gereklidir'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyad gereklidir'],
    trim: true
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

// Şifre hash'leme middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

const User = mongoose.model('User', UserSchema);

// Test kullanıcısı oluşturma
async function createTestUser() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    const testUser = {
      email: 'admin@example.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };

    // Önce kullanıcıyı sil (varsa)
    await User.deleteOne({ email: testUser.email });
    console.log('Existing user deleted (if any)');

    // Yeni kullanıcı oluştur
    const user = new User(testUser);
    await user.save();
    
    console.log('Test user created successfully:', {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Bağlantıyı kapat
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
}

// Script'i çalıştır
createTestUser(); 