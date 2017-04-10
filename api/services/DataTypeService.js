/**
 *  @module
 *  @name DataTypeService
 *  @author Massimiliano Izzo
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails , DataType, DataTypePrivileges, Group, Project */
"use strict";
let Joi = require("joi");
let BluebirdPromise = require("bluebird");
let constants = sails.config.xtens.constants;
let crudManager = sails.hooks['persistence'].getDatabaseManager().crudManager;
const xtensConf = global.sails.config.xtens;
const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;
const VIEW_DETAILS = xtensConf.constants.DataTypePrivilegeLevels.VIEW_DETAILS;
const DOWNLOAD = xtensConf.constants.DataTypePrivilegeLevels.DOWNLOAD;
const EDIT = xtensConf.constants.DataTypePrivilegeLevels.EDIT;

const coroutines = {

    /**
     * @method
     * @name getDataTypePrivilegeLevel
     * @param{Integer - Array} groupsId
     * @param{Integer - Array} dataTypesId
     * @description coroutine for get DataTypes' privileges
     */
    getDataTypePrivilegeLevel: BluebirdPromise.coroutine(function *(groupsId, dataTypesId) {
        if ( typeof dataTypesId === 'undefined' || dataTypesId === null  ) { return BluebirdPromise.resolve(undefined);}
        if ( typeof groupsId === 'undefined' || groupsId === null  ) { return BluebirdPromise.resolve(undefined);}
        sails.log("getDataTypePrivilegeLevel on Datatype: ", dataTypesId, ". Groups: ", groupsId);

        const groups = yield Group.find( {id : groupsId} ).populate('projects');
        let projectsGroups = _.map(groups, function (g) { return _.map(g.projects,'id'); });
        projectsGroups = _.uniq(_.flatten(projectsGroups));

        const projects = yield Project.find( {id : projectsGroups} ).populate('dataTypes');
        let dataTypesProjects = _.map(projects, function (p) { return _.map(p.dataTypes,'id'); });
        dataTypesProjects = _.uniq(_.flatten(dataTypesProjects));

        const dataTypePrivileges = yield DataTypePrivileges.find({ where: {group: groupsId, dataType: dataTypesId} });
        let results = _.map(dataTypePrivileges,function (dtp) {
            if( _.findWhere(dataTypesProjects, dtp.dataType)){
                return dtp;
            }
        });
        results = DataTypeService.getHigherPrivileges(results);
        return results.length === 1 ? results[0] : results;
    }),

    filterDataTypes: BluebirdPromise.coroutine(function *(groupsId, dataTypes) {
        if ( typeof dataTypes === 'undefined' || dataTypes === null  ) { return BluebirdPromise.resolve(undefined);}
        if ( typeof groupsId === 'undefined' || groupsId === null  ) { return BluebirdPromise.resolve(undefined);}


        const groups = yield Group.find( {id : groupsId} ).populate('projects');
        let projectsGroups = _.map(groups, function (g) { return _.map(g.projects,'id'); });
        projectsGroups = _.uniq(_.flatten(projectsGroups));

        const projects = yield Project.find( {id : projectsGroups} ).populate('dataTypes');
        let dataTypesProjects = _.map(projects, function (p) { return _.map(p.dataTypes,'id'); });
        dataTypesProjects = _.uniq(_.flatten(dataTypesProjects));

        let dataTypesFilteredByProjects = _.map(dataTypes, function (d) { if( _.findWhere(dataTypesProjects, d.id)){
            return d;
        } });
        let id = _.map(projects, function (p) { return _.map(p.dataTypes,'id'); });
        id = _.uniq(_.flatten(id));
        const dataTypePrivileges = yield DataTypePrivileges.find({ where: {group: groupsId, dataType:id} });
        let results =_.uniq( _.map(dataTypePrivileges,function (dtp) {
            return _.findWhere(dataTypesFilteredByProjects, {id: dtp.dataType} );
        }));
        return results;
    }),

    getDataTypesToCreateNewPrivileges: BluebirdPromise.coroutine(function *(groupId) {
        let criteriaPriv = {}, criteriaGroup = {};

        if ( typeof groupId !== 'undefined' && groupId !== null  ) { criteriaPriv.group = groupId; criteriaGroup.id = groupId;}

        const groups = yield Group.find( criteriaGroup ).populate('projects');
        let projectsGroups = _.map(groups, function (g) { return _.map(g.projects,'id'); });
        projectsGroups = _.uniq(_.flatten(projectsGroups));

        const privileges = yield DataTypePrivileges.find(criteriaPriv);

        let whereObj = _.isEmpty(privileges) ? {project: projectsGroups} : {
            id: {'!': _.map(privileges, 'dataType')},
            project: projectsGroups
        };

        return DataType.find({ where: whereObj });
    }),

    getDataTypeToEditPrivileges: BluebirdPromise.coroutine(function *(privilegeId, groupId) {
        if ( typeof privilegeId === 'undefined' || privilegeId === null  ) { return BluebirdPromise.resolve(undefined);}
        if ( typeof groupId === 'undefined' || groupId === null  ) { return BluebirdPromise.resolve(undefined);}

        const privilege = yield DataTypePrivileges.findOne({ id: privilegeId, group: groupId }).populate('dataType');

        return privilege.dataType;
    })

    // getDataTypesToEditProject: BluebirdPromise.coroutine(function *() {
    //
    //     let datatypes = yield DataType.find();
    //     datatypes = _.find(datatypes, dt =>{
    //         return dt.project === null;
    //     });
    //
    //     return datatypes ? _.isArray(datatypes) ? datatypes : [datatypes] : [] ;
    // })
};

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
            description: Joi.string().required(),
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
            project: Joi.number().integer().required(),
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
                description: Joi.string().required(),
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
                project: Joi.number().integer().required(),
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
        .catch(
          /* istanbul ignore next */
          function(err) {
              sails.log("DataTypeService.putMetadataFieldsIntoEAV - error caught: ", err);
          });

    },

    /**
     * @method
     * @name getDataTypePrivilege
     * @param{integer} privilegesId - primary key
     * @param{function} next
     */
    getDataTypePrivilege: function(privilegeId, next) {
        sails.log("DataTypeService.getDataTypePrivilege - privilegesId: " + privilegeId);
        if (!privilegeId) {
            return next();
        }
        else {
            return DataTypePrivileges.findOne({id: privilegeId}).populate('dataType').exec(next);
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
     // TODO: populate dataType Privilege? - filter by project
    getDataTypeToEditPrivileges: function(privilegeId, groupId) {
        sails.log("getDataTypeToEditPrivileges on privilege: ", privilegeId, " on group:", groupId);
        return coroutines.getDataTypeToEditPrivileges(privilegeId, groupId)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
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
     //TODO: - filter by project
    getDataTypesToCreateNewPrivileges: function(groupId) {
        sails.log("getDataTypesToCreateNewPrivileges on groupId: " + groupId);
        return coroutines.getDataTypesToCreateNewPrivileges(groupId)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    },

    /**
     * @method
     * @name getDataTypePrivilegeLevel
     * @param{integer - array} groupsId
     * @param{integer - array} dataTypesId
     * @param{function} next - callback function
     * @description service function to retrieve the dataType privilege
     */
    getDataTypePrivilegeLevel: function(groupsId, dataTypesId) {

        return coroutines.getDataTypePrivilegeLevel(groupsId, dataTypesId)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    },

    /**
     * @method
     * @name filterDataTypes
     * @param{integer} groupsId
     * @param{array} dataTypes
     * @description service function to filter dataTypes compared to operator Privileges
     */
    filterDataTypes: function(groupsId, dataTypes) {

        return coroutines.filterDataTypes(groupsId, dataTypes)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    },

    /**
     * @method
     * @name getHigherPrivileges
     * @param{array} privileges
     * @description return the higher privileges in array
     * @return {Object} - the found DataType
     */
    getHigherPrivileges: function(privileges) {
        let levels = {};
        if (!privileges || _.isEmpty(privileges)) {return [];}
        if ( privileges.length === 1 ) { return privileges;}

        var groupedPriv = _.mapValues(_.groupBy(privileges, 'dataType'));
        _.forEach(groupedPriv, function (list,key) {
            levels[key] = {};
            _.forEach(list, function (el) {
                if(!levels[key].privilegeLevel || el.privilegeLevel === EDIT){
                    levels[key] = el;
                    if( levels[key].privilegeLevel === EDIT){ return false; }
                }
                else if (levels[key].privilegeLevel === VIEW_OVERVIEW && (el.privilegeLevel === VIEW_DETAILS || el.privilegeLevel === DOWNLOAD)) {
                    levels[key] = el;
                }
                else if (levels[key].privilegeLevel === VIEW_DETAILS && el.privilegeLevel === DOWNLOAD) { levels[key] = el; }
            });
        });
        let results = _.values(levels);
        return results;
    }

    /**
     * @method
     * @name getDataTypesToEditProject
     * @description return the higher privileges in array
     * @return {Array} - Datatypes not yet associated with a project
     */
    // getDataTypesToEditProject: function() {
    //     return coroutines.getDataTypesToEditProject()
    //     .catch(function(err) {
    //         sails.log(err);
    //         return err;
    //     });
    // }


};
module.exports = DataTypeService;
