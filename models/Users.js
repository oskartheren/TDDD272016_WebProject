var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  scores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Score'
  }]
});

mongoose.model('User', UserSchema);
