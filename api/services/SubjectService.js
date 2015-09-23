/** 
 *  @module 
 *  @name SubjectService
 *  @author Massimiliano Izzo
 */
var BluebirdPromise = require('bluebird');
var Joi = require("joi");
// var constants = sails.config.xtens.constants;

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

    /**
     * @method
     * @name validate
     * @param{Object} subject - the subject to be validated
     * @param{boolean} performMetadataValidation - if true perform the metadata validation
     * @param{Object} dataType - the dataType containing the schema aginst which the data's metadata are to be validated
     * @return {Object} - the result object contains two properties:
     *                      - error: null if the Data is validated, an Error object otherwise
     *                      - value: the validated data object if no error is returned
     */
    validate: function(subject, performMetadataValidation, dataType) {
        var validationSchema = {
            id: Joi.number().integer().positive(),
            type: Joi.number().integer().positive().required(),
            code: Joi.string(),
            sex: Joi.string().required().valid(_.values(sails.config.xtens.constants.SexOptions)),
            personalInfo: Joi.number().integer().positive(),
            projects: Joi.array().allow(null),
            samples: Joi.array().allow(null),
            childrenData: Joi.array().allow(null),
            tags: Joi.array().allow(null),
            notes: Joi.string().allow(null),
            metadata: Joi.object().required(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };

        if (performMetadataValidation) {
            var metadataValidationSchema = {};
            var flattenedFields = DataTypeService.getFlattenedFields(dataType);
            _.each(flattenedFields, function(field) {
                metadataValidationSchema[field.formattedName] = DataService.buildMetadataFieldValidationSchema(field);
            });
            validationSchema.metadata = Joi.object().required().keys(metadataValidationSchema);
        }

        validationSchema = Joi.object().keys(validationSchema);
        return Joi.validate(subject, validationSchema);
    },
    
    /**
     * @method
     * @name anonymize
     * TODO
     */
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
