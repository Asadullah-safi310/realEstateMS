const { User } = require('../../models');

const getPublicUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['user_id', 'full_name', 'profile_picture', 'bio', 'phone', 'email', 'role', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPublicUserProfile,
};
