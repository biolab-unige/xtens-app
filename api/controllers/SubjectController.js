/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
            SubjectService.terminateTransaction(error, results, res);
        });

    },
    
    findWithPersonalDetails: function(req, res) {
        var subjectCriteria = req.allParams();
        Subject.find().where(subjectCriteria).populate('personalInfo').populate('projects')
        .exec(function(error, result) {
            if (error) {
                res.send(error); 
            }
            else {
                res.json(result);
            }
        });
    },

    findOneWithPersonalDetails: function(req, res) {
        var id = parseInt(req.param("id"));
        Subject.findOne(id).populate("personalInfo").populate("projects")
        .exec(function(error, result) {
            if (error) {
                res.send(error);
            }
            else {
                res.json(result);
            }
        });
    },

    updateWithPersonalDetails: function(req, res) {
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
            SubjectService.terminateTransaction(err, results, res);
        });    
    },
    
    deleteWithPersonalDetails: function(req, res) {
        // TODO
    }
    

};

