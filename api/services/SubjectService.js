/**
 *  @author Massimiliano Izzo
 */
var BluebirdPromise = require('bluebird');

var SubjectService = BluebirdPromise.promisifyAll({

    createPersonalDetails: function(personalDetails, next) {
        if (!personalDetails) {
            next(null, null);
        }
        else {
            PersonalDetails.create(personalDetails).exec(next);
        }

    },

    createSubject: function(subjectObj) {
        // Subject.create(subjectObj).
    },

    anonymize: function() {},

    getOne: function(next, id) {
        if (!id) {
            next(null, null);
        }
        else {
            Subject.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    }

});
module.exports = SubjectService;
