'use strict';

/*
var cl = console.log;
console.log = function(){
  console.trace();
  cl.apply(console,arguments);
};
*/

process.env.NODE_CONFIG_DIR = './config/env';

// Requires meanio .
var mean = require('meanio');
var cluster = require('cluster');
var deferred = require('q').defer();


// Code to run if we're in the master process or if we are not in debug mode/ running tests

if ((cluster.isMaster) &&
    (process.execArgv.indexOf('--debug') < 0) &&
    (process.env.NODE_ENV!=='test') && 
    (process.env.NODE_ENV!=='development') &&
    (process.execArgv.indexOf('--singleProcess')<0)) {
//if (cluster.isMaster) {

    console.log('for real!');
    // Count the machine's CPUs
    var cpuCount = process.env.CPU_COUNT || require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        console.log ('forking ',i);
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {

    var workerId = 0;
    if (!cluster.isMaster)
    {
        workerId = cluster.worker.id;
    }
// Creates and serves mean application
    mean.serve({ workerid: workerId /* more options placeholder*/ }, function (app) {
      var config = app.getConfig();
      var port = config.https && config.https.port ? config.https.port : config.http.port;
      console.log('Mean app started on port ' + port + ' (' + process.env.NODE_ENV + ') cluster.worker.id:', workerId);

      deferred.resolve(app);
    });
}

module.exports = deferred.promise;

/*
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost/mean-dev', function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

*/
