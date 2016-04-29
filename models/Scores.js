var mongoose = require('mongoose');

var ScoreSchema = new mongoose.Schema({
  points: Number,
  userName: String,
});

mongoose.model('Score', ScoreSchema);
