/**
 *  @author Massimiliano Izzo
 */
var BluebirdPromise = require("bluebird");
var Migrator = require('migrate-utils').Migrator;

var MigrateService = BluebirdPromise.promisifyAll({

    execute: function() {
        var migrator = new Migrator();
        // migrator.migrateProjects()
        return migrator.migrateAllSubjects()
        // return migrator.migrateCompleteSubject(idSubj)
        .then(function() { 
            console.log('Done!');
            return true; 
        })
        .catch(function(err) { 
            console.log(err.message); 
            throw new Error(err.details || err.message);
        });
    },

    migrateCGH: function(next) {
        var migrator = new Migrator();
        var path = "/home/massi/Projects/aCGH/FileBIT/";
        return migrator.migrateCGH(path, '.xlsx');
    }
});

module.exports = MigrateService;
