const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // ... login işlemleri
  } catch (error) {
    console.error('Login Error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userId = req.user._id;

    console.log('UpdateProfile - Request:', {
      userId,
      body: req.body,
      headers: req.headers,
      user: req.user
    });

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName,
          lastName,
          email,
          updatedAt: Date.now()
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('User not found:', userId);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    console.log('User Updated:', updatedUser);

    res.json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update profile'
    });
  }
};

// Favori haberleri getir
exports.getFavoriteNews = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('favoriteNews')
      .select('favoriteNews');

    res.json({
      status: 'success',
      data: {
        favoriteNews: user.favoriteNews
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 