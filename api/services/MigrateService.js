/**
 *  @author Massimiliano Izzo
 */
var BluebirdPromise = require("bluebird");
var Migrator = require('migrate-utils').Migrator;

var MigrateService = BluebirdPromise.promisifyAll({

    execute: function(idSubj) {
        console.log(Migrator);
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
        var path = "/home/massi/Projects/aCGH/FileBIT/15-H-00455.xlsx";
        migrator.migrateCGHRecord(path, next);
    }
});

module.exports = MigrateService;
