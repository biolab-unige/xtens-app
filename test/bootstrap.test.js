var Sails = require('sails');
var Barrels = require('barrels');
var path = require('path');

var sails;

// Global before hook
before(function(done) {
    console.log("bootstrap.test.js - before function started!");
    Sails.lift({

        hooks: {grunt: false}

    }, function(err, res) {

        if (err) {
            console.log("error lifting sails");
            return done(err);
        }
        console.log("sails was lifted");
    // Load fixtures
        var barrels = new Barrels();
        var loadingOrder = [ 'project', 'group', 'datatype', 'supertype', 'datatypeprivileges', 'operator', 'passport', 'subject', 'sample', 'data', 'datafile','biobank'];
    // Save original objects in fixtures variable
        fixtures = barrels.data;

        sails = res;
        sails.config.pathGeneFile = path.join('test', 'resources', 'gene-file-test.csv');

        barrels.populate(loadingOrder, function(err){
            if (err) {
                console.log(err);
                done(err);
            }
            done(err, res);
        }, false);
    });
});

// Global after hook
after(function(done) {
  // here you can clear fixtures, etc.
    sails.lower(done);
});
