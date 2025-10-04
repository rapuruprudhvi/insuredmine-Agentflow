const Policy = require('../models/Policy');
const User = require('../models/User');
const LOB = require('../models/LOB');
const Carrier = require('../models/Carrier');

const searchPolicyByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const user = await User.findOne({
      first_name: { $regex: username, $options: 'i' },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const policies = await Policy.find({ user_id: user._id })
      .populate('policy_category_id', 'category_name')
      .populate('company_id', 'company_name')
      .populate('user_id', 'first_name email phone_number');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Aggregate policies by user
const getAggregatedPoliciesByUser = async (req, res) => {
  try {
    const aggregatedData = await Policy.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'lobs',
          localField: 'policy_category_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'carriers',
          localField: 'company_id',
          foreignField: '_id',
          as: 'carrier',
        },
      },
      { $unwind: '$carrier' },
      {
        $group: {
          _id: '$user_id',
          user_name: { $first: '$user.first_name' },
          user_email: { $first: '$user.email' },
          total_policies: { $sum: 1 },
          policies: {
            $push: {
              policy_number: '$policy_number',
              policy_start_date: '$policy_start_date',
              policy_end_date: '$policy_end_date',
              category_name: '$category.category_name',
              carrier_name: '$carrier.company_name',
            },
          },
        },
      },
      { $sort: { total_policies: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: aggregatedData.length,
      data: aggregatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  searchPolicyByUsername,
  getAggregatedPoliciesByUser,
};
