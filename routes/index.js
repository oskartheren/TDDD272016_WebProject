var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Score = mongoose.model('Score');


router.get('/users', function(req, res, next) {
  User.find(function(err, users){
    if(err){ return next(err); }

    res.json(users);
  });
});

router.post('/users', function(req, res, next) {
  var user = new User(req.body);

  user.save(function(err, user){
    if(err){ return next(err); }

    res.json(user);
  });
});


router.param('user', function(req, res, next, id) {
  var query = User.findById(id);

  query.exec(function (err, user){
    if (err) { return next(err); }
    if (!user) { return next(new Error('can\'t find user')); }

    req.user = user;
    return next();
  });
});


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

router.get('/users/:user', function(req, res, next) {
  req.user.populate('scores', function(err, user) {
    if (err)
      return next(err);
    res.json(user);
  });
});
