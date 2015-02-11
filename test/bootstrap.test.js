var Sails = require('sails');
var Barrels = require('barrels');

var sails;

// Global before hook
before(function(done) {
  console.log("bootstrap.test.js - before function started!");
  Sails.lift({
    log: {
        level: 'error'
    },
    models: {
        connection: 'test',
        migrate: 'drop'
    }
  }, function(err, res) {
    if (err) {
        console.log("error lifting sails");
        return done(err);
    }
    console.log("sails was lifted");
    // Load fixtures
    var barrels = new Barrels();

    // Save original objects in fixtures variable
    fixtures = barrels.data;
    
    sails = res;
    barrels.populate(function(err){
        console.log(err);
        done(err, res);
    }, false);
  });
});

// Global after hook
after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
