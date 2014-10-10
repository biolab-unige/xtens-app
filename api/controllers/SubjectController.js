/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var async = require('async');

module.exports = {

    createWithPersonalDetails: function(req, res) {
        var subjectRecord = req.body;
        async.auto({
            transaction: function(next) {
                Subject.query('BEGIN TRANSACTION', next);
            },
            personalDetails: ['transaction', function(next) {
                PersonalDetails.create(subjectRecord.personalInfo).exec(next);
            }],
            subject: ['personalDetails', function(next, results) {
                subjectRecord.personalInfo = results.personalDetails;
                Subject.create(subjectRecord).exec(next);
            }]        
        }, function(error, results) {
            if (error) {
                Subject.query('ROLLBACK', function(err, rolledback) {
                    if (err) {
                        res.send(500, "Tried to rollback, but failed.");
                    }
                    else {
                        res.send(400, error);
                    }
                });
            }
            else {
                Subject.query('COMMIT', function(err, committed) {
                    if (err) {
                        res.send(500, "Commit failed.");
                    }
                    else {
                        res.json(results.subject);
                    }
                });
            }
        });

    },
    
    findWithPersonalDetails: function(req, res) {
        var subjectRecord = req.body;
        async.auto({
            transaction: function(next) {
                Subject.query('BEGIN TRANSACTION', next);
            },
            personalDetails: ['transaction', function(next) {
                PersonalDetails.update(subjectRecord.personalInfo).exec(next);
            }],
            subject: ['transaction', function(next, results) {
                Subject.update(subject).exec(next);
            }]
        }, function(err, results) {
            // TODO
        });
    },

    updateWithPersonalDetails: function(req, res) {
        // TODO
    },
    
    deleteWithPersonalDetails: function(req, res) {
        // TODO
    }
    

};

