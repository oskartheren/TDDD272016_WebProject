var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  userName: String,
  password: String,
  scores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Score' }]
});

mongoose.model('User', UserSchema);
