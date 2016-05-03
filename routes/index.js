var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Score = mongoose.model('Score')

router.get('/scores', function(req, res, next) {
  Score.find({}).sort('-points').exec(function(err, scores){
    if(err){ return next(err); }

    res.json(scores);
  });
});

router.post('/scores', function(req, res, next) {
  var score = new Score(req.body);
  score.save(function(err, score){
    if(err){ return next(err); }

    res.json(score);
  });
});
