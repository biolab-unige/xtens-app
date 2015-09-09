/**
 *  @author Massimiliano Izzo
 */
var BluebirdPromise = require('bluebird');

var SubjectService = BluebirdPromise.promisifyAll({

    /**
     * @method
     * @name simplify
     * @description removes all associated Objects if present keeping only their primary keys (i.e. IDs)
     */
    simplify: function(subject) {
        ["type"].forEach(function(elem) {
            if (subject[elem]) {
                subject[elem] = subject[elem].id || subject[elem];
            }
        });
        
        // replace each project with its ID
        if (_.isArray(subject.projects)) {
            
            var simplifiedProjects = [];

            subject.projects.forEach(function(project) {
                simplifiedProjects.push(project.id || project);
            });
            
            subject.projects = simplifiedProjects;

        }

        console.log("simplified project array: " + subject.projects);

    }, 


    anonymize: function() {},

    /**
     * @method 
     * @name getOne
     * @description find a Subject if ID is provided
     * @return {Object} - the found Subject
     */
    getOne: function(id, next) {
        if (!id) {
            next(null, null);
        }
        else {
            Subject.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    }

});
module.exports = SubjectService;
