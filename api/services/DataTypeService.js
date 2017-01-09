/**
 *  @module
 *  @name DataTypeService
 *  @author Massimiliano Izzo
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails , DataType, Operator, DataTypePrivileges */
"use strict";
let Joi = require("joi");
let BluebirdPromise = require("bluebird");
let constants = sails.config.xtens.constants;
let crudManager = sails.config.xtens.crudManager;

let DataTypeService = {

    /**
     * @method
     * @name validateMetadataField
     */
    validateMetadataField: function(field) {
        let metadataFieldValidationSchema = Joi.object().keys({
            name: Joi.string().required(),
            formattedName: Joi.string().required(),
            fieldType: Joi.string().required().valid(_.values(constants.FieldTypes)),
            label: Joi.string().required().valid(constants.METADATA_FIELD),
            isList: Joi.boolean().required(),
            possibleValues: Joi.array().allow(null),
            hasUnit: Joi.boolean().required(),
            possibleUnits: Joi.array().allow(null),
            required: Joi.boolean().required(),
            sensitive: Joi.boolean().default(false),
            visible: Joi.boolean().default(true),
            caseInsensitive: Joi.boolean().invalid(true)
            .when('fieldType', {is: constants.FieldTypes.TEXT, then: Joi.boolean().default(false)})
            .concat(Joi.boolean().when('isList', {is: true, then: Joi.boolean().invalid(true).default(false)})),
            hasRange: Joi.boolean().required(),
            min: Joi.number().allow(null),
            max: Joi.number().allow(null),
            step: Joi.number().allow(null),
            customValue: Joi.any().allow(null),
            ontologyUri: Joi.string().allow(null),
            _loop: Joi.boolean(),       // optional private boolean field that specifies whether the current field belongs to a metadata loop
            _group: Joi.string()        // optional private string field that specifies the group name
        });
        return Joi.validate(field, metadataFieldValidationSchema);
    },

    /**
     * @method
     * @name validate
     * @description validata a DataType, especially its schema
     * @param{Object} dataType - the data type to be validated
     * @param{boolean} performSchemaValidation - if true perform also DataType schema validation
     * @return {Object} - the result object contains two properties:
     *                      - error: null if the DataType is validated, an Error object otherwise
     *                      - value: the validated DataType object if no error is returned
     */
    validate: function(dataType, performSchemaValidation) {

        let validationSchema = {
            id: Joi.number().integer().positive(),
            name: Joi.string().required(),
            model: Joi.string().required().valid(_.values(constants.DataTypeClasses)),
            schema: Joi.object().required(),
            parents: Joi.array().allow(null),
            children: Joi.array().allow(null),
            data: Joi.array().allow(null),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };

        if (performSchemaValidation) {

            let metadataFieldValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                formattedName: Joi.string().required(),
                fieldType: Joi.string().required().valid(_.values(constants.FieldTypes)),
                label: Joi.string().required().valid(constants.METADATA_FIELD),
                isList: Joi.boolean().required(),
                possibleValues: Joi.array().allow(null),
                hasUnit: Joi.boolean().required(),
                possibleUnits: Joi.array().allow(null),
                required: Joi.boolean().required(),
                sensitive: Joi.boolean().default(false),
                visible: Joi.boolean().default(true),
                caseInsensitive: Joi.boolean().invalid(true)
                .when('fieldType', {is: constants.FieldTypes.TEXT, then: Joi.boolean()})
                .concat(Joi.boolean().when('isList', {is: true, then: Joi.boolean().invalid(true).default(false)})),
                hasRange: Joi.boolean().required(),
                min: Joi.number().allow(null),
                max: Joi.number().allow(null),
                step: Joi.number().allow(null),
                customValue: Joi.any().allow(null),
                ontologyUri: Joi.string().allow(null),
                _loop: Joi.boolean(),       // optional private boolean field that specifies whether the current field belongs to a metadata loop
                _group: Joi.string()        // optional private string field that specifies the group name
            });

            let metadataLoopValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                label: Joi.string().required().valid(constants.METADATA_LOOP),
                content: Joi.array().required().items(metadataFieldValidationSchema)
            });

            let metadataGroupValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                label: Joi.string().required().valid(constants.METADATA_GROUP),
                content: Joi.array().required().items(metadataLoopValidationSchema, metadataFieldValidationSchema)
            });

            let metadataHeaderValidationSchema = Joi.object().keys({
                name: Joi.string().required(),
                description: Joi.string().required(),
                model: Joi.string().valid(_.values(constants.DataTypeClasses)),
                fileUpload: Joi.boolean().required(),
                version: Joi.string().allow(""),
                ontology: Joi.string().allow("")
            });

            validationSchema.schema = Joi.object().required().keys({
                header: metadataHeaderValidationSchema,
                body: Joi.array().required().items(metadataGroupValidationSchema)
            });


        }

        validationSchema = Joi.object().keys(validationSchema);
        return Joi.validate(dataType, validationSchema);

    },

    /**
     * @method
     * @name get
     * @return {Array} - list of found DataType entities
     */

    get: /*istanbul ignore next*/ function(params, next) {
        let criteriaObj = { model: params.model };
        if (params) {
            let ids = params.idDataTypes.split(",");
            criteriaObj.id = ids;
        }
        DataType.find(criteriaObj).populateAll().exec(next); // do we need populateAll here?
    },

    /**
     * @method
     * @name getFlattenedFields
     * @description flattens the metadata schema returning a 1D array containing all the metadata fields
     * @param {DataType} dataType - the DataType record whose schema is to flatten
     * @param {boolean} skipFieldsWithinLoops - if true skips all the metadatafields that are contained within metadata loops
     */

    getFlattenedFields: function(dataType, skipFieldsWithinLoops) {
        let flattened = [];
        let body = dataType.schema && dataType.schema.body;

        // if no body return an empty array
        if (!body) return flattened;

        // iterate through all groups within the body
        for (let i=0, len=body.length; i<len; i++) {
            let groupContent = body[i] && body[i].content;

            // iterate through all the fields/loops
            for (let j=0, l=groupContent.length; j<l; j++) {
                if (groupContent[j].label === constants.METADATA_FIELD) {
                    flattened.push(groupContent[j]);
                }
                else if (groupContent[j].label === constants.METADATA_LOOP && !skipFieldsWithinLoops) {
                    let loopContent = groupContent[j] && groupContent[j].content;
                    for (let k=0; k<loopContent.length; k++) {
                        if (loopContent[k].label === constants.METADATA_FIELD) {

                            // add to the field a private flag that specifies its belonging to a loop
                            flattened.push(_.extend(loopContent[k], {_loop: true}));

                        }
                    }
                }

            }
        }
        return flattened;
    },

    /**
     * @method
     * @name putMetadataFieldIntoEAV
     * @description extract the Metadata Fields from the JSON schema and stores each one in a dedicated
     *              ATTRIBUTE table, for use in an EAV catalogue
     * @param {Integer} dataType - the id of the DataType
     */
    putMetadataFieldsIntoEAV: function(dataType) {

        // check whether the dataType effectively exists
        return DataType.findOne(dataType)

        // extract and store all metadata fields
        .then(function(foundType) {
            sails.log("DataTypeService.putMetadataFieldsIntoEAV - found type" + foundType);
            let fields = DataTypeService.getFlattenedFields(foundType, false);
            return crudManager.putMetadataFieldsIntoEAV(foundType.id, fields, true);
        })
        .then(function(inserted) {
            sails.log("new EavAttributes inserted: ", inserted);
        })
        .catch(function(err) {
            sails.log("DataTypeService.putMetadataFieldsIntoEAV - error caught: ", err);
        });

    },

    /**
     * @method
     * @name getDataTypePrivileges
     * @param{integer} privilegesId - primary key
     * @param{function} next
     */
    getDataTypePrivileges: function(privilegesId, next) {
        sails.log("DataTypeService.getDataTypePrivileges - privilegesId: " + privilegesId);
        if (!privilegesId) {
            return next();
        }
        else {
            return DataTypePrivileges.findOne({id: privilegesId}).exec(next);
        }
    },

    /**
     * @method
     * @name getDataTypesToEditPrivileges
     * @param{integer} privilegesId
     * @param{function} next - callback function
     * @description service function to retrieve the right dataType when editing
     *              an existing DataTypePrivileges entity
     */
    getDataTypeToEditPrivileges: function(privilegeId) {
        sails.log("getDataTypeToEditPrivileges on privilege: ", privilegeId);
        if (privilegeId) {
            return DataTypePrivileges.findOne({ id: privilegeId })

            .then(function(privileges) {
                sails.log(privileges);
                return DataType.findOne({id: privileges.dataType});
            });
        }
        else {
            return BluebirdPromise.resolve(undefined);
        }
    },

    /**
     * @method
     * @name getDataTypesToCreateNewPrivileges
     * @param{integer} groupId
     * @param{integer} privilegesId
     * @param{function} next - callback function
     * @description service function to retrieve the right set of dataType(s) when creating
     *              a new DataTypePrivileges entity
     */
    getDataTypesToCreateNewPrivileges: function(groupId) {
        sails.log("getDataTypePrivilegeLevel on groupId: " + groupId);
        if (groupId) {
            return DataTypePrivileges.find({ group: groupId })

            .then(function(privileges) {
                sails.log(privileges);

                let whereObj = _.isEmpty(privileges) ? {} : {
                    id: {'!': _.pluck(privileges, 'dataType')}
                };

                return DataType.find({ where: whereObj });
            });
        }
        else {
            return BluebirdPromise.resolve(undefined);
        }
    },

    /**
     * @method
     * @name getDataTypePrivilegeLevel
     * @param{integer} operatorId
     * @param{integer} dataTypesId
     * @param{function} next - callback function
     * @description service function to retrieve the dataType privilege
     */
    getDataTypePrivilegeLevel: function(operatorId, dataTypesId) {
        let groupId;
        if ( typeof dataTypesId !== 'undefined' && dataTypesId !== null ) {
            sails.log("getDataTypePrivilegeLevel on Datatype: " + dataTypesId + ". Operator: " + operatorId);

            return Operator.findOne( {id : operatorId} ).populate('groups').then(operator => {
                groupId = _.pluck(operator.groups,'id');

                return DataTypePrivileges.find({ where: {group: groupId, dataType: dataTypesId} });
            })
            .then(dataTypePrivileges => {
                return dataTypePrivileges.length === 1 ? dataTypePrivileges[0] : dataTypePrivileges;
            })
            .catch((err) => {
                sails.log(err);
                return err;
            });

        }
        else {
            return BluebirdPromise.resolve(undefined);
        }
    },

    /**
     * @method
     * @name filterDataTypes
     * @param{integer} operatorId
     * @param{array} dataTypes
     * @description service function to filter dataTypes compared to operator Privileges
     */
    filterDataTypes: function(operatorId, dataTypes) {
        let groupId;
        if ( typeof dataTypes !== 'undefined' && dataTypes !== null ) {

            return Operator.findOne( {id : operatorId} ).populate('groups').then(function(operator) {

                groupId = _.pluck(operator.groups,'id');

                return DataTypePrivileges.find( {group: groupId} );
            })
            .then(dataTypePrivileges => {
                if (_.isEmpty(dataTypePrivileges)){
                    return dataTypes = [];
                }

                let idPriv = _.pluck(dataTypePrivileges,'dataType');
                for(let datatype of dataTypes){
                  //If there is not privilege on datatype, remove it from datatypes array
                    if( _.indexOf( idPriv, datatype.id) < 0){
                        dataTypes = _.without(dataTypes, _.findWhere(dataTypes, {id: datatype.id}));
                    }
                }
                return dataTypes;
            })
            .catch((err) => {
                sails.log(err);
                return err;
            });
        }
        else {
            return BluebirdPromise.resolve(undefined);
        }
    }

    /**
     * @method
     * @name getOne
     * @description find a Datatype if ID is provided
     * @return {Object} - the found DataType
     */
    // getOne: function(id) {
    //     if (!id) {
    //         return BluebirdPromise.resolve(null);
    //     }
    //     else {
    //         let criteria = {};
    //
    //         if (id) criteria.id = id;
    //
    //         sails.log(criteria);
    //         return DataType.findOne(criteria).populate('parents');
    //     }
    // }


};
module.exports = DataTypeService;
