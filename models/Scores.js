var mongoose = require('mongoose');

var ScoreSchema = new mongoose.Schema({
  points: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Score', ScoreSchema);
