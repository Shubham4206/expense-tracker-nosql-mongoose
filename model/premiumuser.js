const mongoose = require('mongoose');

const premiumUserSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String,
  status: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const PremiumUser = mongoose.model('PremiumUser', premiumUserSchema);

module.exports = PremiumUser;

