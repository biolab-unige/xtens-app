/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;

module.exports = {

    create: function(req, res) {
        var subject = req.body;
        var personalDetails = subject.personalInfo;
        
        SubjectService.createPersonalDetailsAsync(personalDetails)
        .then(function(createdPersonalDetails) {
            subject.personalInfo = createdPersonalDetails.id;
            return DataType.findOne(subject.type);
        }) 
        .then(function(subjectType) {
            var subjectTypeName = subjectType && subjectType.name;
            return transactionHandler.createSubject(subject, subjectTypeName);
        })
        .then(function(idSubject) {
            console.log(idSubject);
            return Subject.findOne(idSubject).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
            return res.serverError(error.message);
        });
    },

    /*
    find: function(req, res) {
        var subjectCriteria = req.allParams();
        Subject.find().where(subjectCriteria).populate('projects').populate('samples').populate('childrenData')
        .then(function(subjects) {
        
        });
    }, */

    edit: function(req, res) {
        
        var id = req.param("id");

        async.parallel({
            
            projects: function(callback) {
                Project.find().exec(callback);
            },

            dataTypes: function(callback) {
                DataTypeService.getAsync(callback, { classTemplate: 'Subject'});
            },

            subject: function(callback) {
                SubjectService.getOne(callback, id);
            }

        }, function(err, results) {
            if (err) {
                return res.serverError(err);
            }
            return res.json(results);
            
        });

    }
    

};

