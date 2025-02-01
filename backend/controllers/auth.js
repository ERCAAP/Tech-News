const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userId = req.user.id;

    console.log('Update Profile Request:', {
      userId,
      updates: { firstName, lastName, email }
    });

    // Email benzersizliğini kontrol et
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    console.log('User Updated:', updatedUser);

    res.json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update profile'
    });
  }
}; 