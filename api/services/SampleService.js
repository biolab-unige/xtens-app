/**
 *  @author Massimiliano Izzo
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails, Sample, DataType, DataTypeService, DataService, SubjectService, QueryService, TokenService */
"use strict";
let BluebirdPromise = require('bluebird');
let Joi = require("joi");
let SAMPLE = sails.config.xtens.constants.DataTypeClasses.SAMPLE;
let SampleService = BluebirdPromise.promisifyAll({

    /**
     * @method
     * @name simplify
     * @description removes all associated Objects if present keeping only their primary keys (i.e. IDs)
     */
    simplify: function(sample) {
        ["type", "donor", "parentSample", "biobank"].forEach(elem => {
            if (sample[elem]) {
                sample[elem] = sample[elem].id || sample[elem];
            }
        });
    },

    /**
     * @method
     * @name validate
     * @description validata a sample instance against the given schema
     * @param{Object} sample - the sample to be validated
     * @param{boolean} performMetadataValidation - if true perform the metadata validation
     * @param{Object} dataType - the dataType containing the schema aginst which the data's metadata are to be validated
     * @return {Object} - the result object contains two properties:
     *                      - error: null if the Data is validated, an Error object otherwise
     *                      - value: the validated data object if no error is returned
     */
    validate: function(sample, performMetadataValidation, dataType) {
        
        if (dataType.model !== SAMPLE) {
            return {
                error: "This data type is for another model: " + dataType.model
            };
        }

        let validationSchema = {
            id: Joi.number().integer().positive(),
            type: Joi.number().integer().positive().required(),
            biobank: Joi.number().integer().positive().required(),
            biobankCode: Joi.string().allow("").allow(null), // TODO change this one
            donor: Joi.number().integer().positive(),
            parentSample: Joi.number().integer().positive(),
            tags: Joi.array().allow(null),
            notes: Joi.string().allow(null),
            metadata: Joi.object().required(),
            files: Joi.array().items(Joi.object().keys({
                uri: Joi.string(),
                name: Joi.string()
            })),
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
        return Joi.validate(sample, validationSchema);
    },

    /**
     * @method
     * @name getOne
     * @description get a Sample model from the ID if an ID is provided
     */
    getOne: function(id, next) {
        if (!id) {
            next(null, null);
        }
        else {
            Sample.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    }

});
module.exports = SampleService;
