var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Score = mongoose.model('Score')
// var Post = mongoose.model('Post');
// var Comment = mongoose.model('Comment');

router.get('/scores', function(req, res, next) {
  Score.find(function(err, scores){
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
//
// router.param('post', function(req, res, next, id) {
//   var query = Post.findById(id);
//
//   query.exec(function (err, post){
//     if (err) { return next(err); }
//     if (!post) { return next(new Error('can\'t find post')); }
//
//     req.post = post;
//     return next();
//   });
// });
//
// router.get('/posts/:post', function(req, res, next) {
//   req.post.populate('comments', function(err, post) {
//     if (err) { return next(err); }
//
//     res.json(post);
//   });
// });
//
// router.put('/posts/:post/upvote', function(req, res, next) {
//   req.post.upvote(function(err, post){
//     if (err) { return next(err); }
//
//     res.json(post);
//   });
// });
//
// router.post('/posts/:post/comments', function(req, res, next) {
//   var comment = new Comment(req.body);
//   comment.post = req.post;
//
//   comment.save(function(err, comment){
//     if(err){ return next(err); }
//
//     req.post.comments.push(comment);
//     req.post.save(function(err, post) {
//       if(err){ return next(err); }
//
//       res.json(comment);
//     });
//   });
// });
//
//
// router.param('comment', function(req, res, next, id) {
//   var query = Comment.findById(id);
//
//   query.exec(function (err, comment){
//     if (err) { return next(err); }
//     if (!comment) { return next(new Error('can\'t find comment')); }
//
//     req.comment = comment;
//     return next();
//   });
// });
//
//
// router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
//   req.comment.upvote(function(err, comment){
//     if (err) { return next(err); }
//
//     res.json(comment);
//   });
// });
