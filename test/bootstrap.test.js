var Sails = require('sails');
var Barrels = require('barrels');

var sails;

// Global before hook
before(function(done) {
  console.log("bootstrap.test.js - before function started!");
  Sails.lift({
    /*
    log: {
        level: 'debug'
    }, */
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
    var loadingOrder = ['group', 'operator', 'passport', 'datatype', 'subject', 'sample', 'data'];
    // Save original objects in fixtures variable
    fixtures = barrels.data;

    sails = res;

    // set up the CRUD Manager for in-memory tests
    const xtens = sails && sails.config && sails.config.xtens;
    const testAdapter = sails.config.connections.test.adapter;
    xtens.databaseManager = require('xtens-waterline');
    xtens.crudManager = new xtens.databaseManager.CrudManager(null, testAdapter);
    console.log(sails.config.xtens.crudManager);
    console.log(global.sails.config.xtens.crudManager);

    barrels.populate(['operator', 'passport'], function(err){
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
