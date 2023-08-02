const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPremiumUser: {
    type: Boolean,
    default: false,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  forgotpasswords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForgotPassword',
  }],
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
  }],
  premiumUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PremiumUser',
  }],
  downloads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Download',
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
