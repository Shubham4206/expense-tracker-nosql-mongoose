const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Download = mongoose.model('Download', downloadSchema);

module.exports = Download;
