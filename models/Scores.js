var mongoose = require('mongoose');

var ScoreSchema = new mongoose.Schema({
  points: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

mongoose.model('Score', ScoreSchema);
