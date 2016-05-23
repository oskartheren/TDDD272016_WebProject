var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var router = express.Router();
var User = mongoose.model('User');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

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

router.param('user', function(req, res, next, userName) {
  var query = User.find({'userName' : userName});
  query.exec(function (err, user){
    if (err) { return next(err); }
    if (!user) { return next(new Error('can\'t find user')); }
    req.user = user[0];

    return next();
  });
});

router.get('/users/:user', function(req, res, next) {
  req.user.populate({path: 'scores', options: { sort: { 'points': -1 } }},  function(err, user) {
    if (err) { return next(err); }
    req.user.hash = null; // Dont send this info
    req.user.salt = null; // Dont send this info
    res.json(req.user);
  });
});

router.post('/users/:user/score', function(req, res, next) {
  var score = new Score(req.body);
  score.user = req.user; // Get the username from the jwt

  score.save(function(err, score){
    if(err){ return next(err); }
    req.user.scores.push(score);
    req.user.save(function(err, post) {
      if(err){ return next(err); }

      res.json(score);
    });
  });
});


router.get('/scores', function(req, res, next) {
  Score.find({}).sort('-points').populate('user').exec(function(err, scores){
    if(err){ return next(err); }

    res.json(scores);
  });
});

router.post('/register', function(req, res, next){
  if(!req.body.userName || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  var query = User.find({'userName' : req.body.userName});
  query.exec(function (err, user){
    if (err) { return next(err); }
    if (user[0]) { return res.status(401).json({message: 'Username already exists'}) }
    var user = new User();
    user.userName = req.body.userName;
    user.setPassword(req.body.password)

    user.save(function (err){
      if(err){ return next(err); }
      return res.json({token: user.generateJWT()})
    });
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.userName || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  req.body.username = req.body.userName; // passport has this value hardcoded
  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});
