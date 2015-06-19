/**
 *  @author Massimiliano Izzo
 */
var Migrator = require('migrate-utils').Migrator;

var MigrateService = {

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
    }
};

module.exports = MigrateService;
