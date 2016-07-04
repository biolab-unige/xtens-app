/**
 *  @module
 *  @name SubjectService
 *  @author Massimiliano Izzo
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails, Subject, DataType, DataService, DataTypeService, QueryService, TokenService */
"use strict";

let XRegExp = require('xregexp');
let BluebirdPromise = require('bluebird');
let Joi = require("joi");
let SUBJECT = sails.config.xtens.constants.DataTypeClasses.SUBJECT;

const UNICODE_NAME_REGEX = new XRegExp("^[\\p{L} .'-]+$");

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
            givenName: Joi.string().uppercase().regex(UNICODE_NAME_REGEX).trim(),
            surname: Joi.string().uppercase().regex(UNICODE_NAME_REGEX).trim(),
            birthDate: Joi.string().isoDate(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };

        let validationSchema = {
            id: Joi.number().integer().positive(),
            type: Joi.number().integer().positive().required(),
            code: Joi.string().uppercase(),
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
    getOne: function(id, code, next) {
        if (!id && !code) {
            next(null, null);
        }
        else {
            let criteria = {};

            if (id) criteria.id = id;
            if (code) criteria.code = code;

            console.log(criteria);
            Subject.findOne(criteria).populateAll().exec(next);
        }
    },

    /**
     * @name hasDataSensitive
     * @description Return a boolean true if data has sensitive attributes, then false
     * @param {integer} - identifier of data
     * @return {Promise} -  a Bluebird Promise with an object containing boolean value of investigation and data
     */
    hasDataSensitive: function(id) {
        let flattenedFields =[], forbiddenFields =[], hasDataSensitive;
      //if canAccessSensitiveData is true skip the function and return data

        return Subject.findOne({id : id}).populate(['type','personalInfo']).then(function(datum){

            //retrieve metadata fields sensitive
            flattenedFields = DataTypeService.getFlattenedFields(datum['type'], false);
            forbiddenFields = _.filter(flattenedFields, function(field) {return field.sensitive;});

            forbiddenFields.length >0 ? hasDataSensitive = true : hasDataSensitive = false;

            let json = {
                hasDataSensitive : hasDataSensitive,
                data : datum,
                flattenedFields : flattenedFields
            };
            return json;

        }).catch(function(err){
            sails.log(err);
            return err;
        });

    }




});
module.exports = SubjectService;
