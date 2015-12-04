/** 
 *  @module 
 *  @name SubjectService
 *  @author Massimiliano Izzo
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails, Subject, DataType, DataService, DataTypeService, QueryService, TokenService */
"use strict";

let BluebirdPromise = require('bluebird');
let Joi = require("joi");
let SUBJECT = sails.config.xtens.constants.DataTypeClasses.SUBJECT;

let SubjectService = BluebirdPromise.promisifyAll({

    /**
     * @method
     * @name simplify
     * @description removes all associated Objects if present keeping only their primary keys (i.e. IDs)
     */
    simplify: function(subject) {
        ["type"].forEach(elem => {
            if (subject[elem]) {
                subject[elem] = subject[elem].id || subject[elem];
            }
        });
        
        // replace each project with its ID
        if (_.isArray(subject.projects)) {
            
            let simplifiedProjects = [];

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

        if (dataType.model !== SUBJECT) {
            return {
                error: "This data type is for another model: " + dataType.model
            };
        }
        
        let personalInfoValidationSchema = {
            id: Joi.number().integer().positive(),
            givenName: Joi.string().regex(/^[A-Za-z ]+$/).trim(),            
            surname: Joi.string().regex(/^[A-Za-z ]+$/).trim(),
            birthDate: Joi.date(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };

        let validationSchema = {
            id: Joi.number().integer().positive(),
            type: Joi.number().integer().positive().required(),
            code: Joi.string(),
            sex: Joi.string().required().valid(_.values(sails.config.xtens.constants.SexOptions)),
            personalInfo: Joi.object().keys(personalInfoValidationSchema).allow(null),
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
            let metadataValidationSchema = {};
            let flattenedFields = DataTypeService.getFlattenedFields(dataType);
            _.each(flattenedFields, field => {
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
