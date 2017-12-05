/**
 *  @author Massimiliano Izzo
 */
/* jshint node: true */
/* globals _, sails, Data, DataType, DataTypeService*/
"use strict";

let BluebirdPromise = require('bluebird');

let FieldTypes = sails.config.xtens.constants.FieldTypes;
let Joi = require('joi');
let crudManager = sails.hooks['persistence'].getDatabaseManager().crudManager;
let queryBuilder = sails.hooks['persistence'].getDatabaseManager().queryBuilder;
const co = require('co');
const DATA = sails.config.xtens.constants.DataTypeClasses.DATA;
const VIEW_OVERVIEW = sails.config.xtens.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;

const coroutines = {

    /**
     * @method
     * @name validate
     * @param{ Object } data to be validated
     * @param{ boolean} perform metadata validation
     * @param{ Object } data type object
     * @description coroutine for data validation
     */
    validate: BluebirdPromise.coroutine(function *(data, performMetadataValidation, dataType) {

        if (dataType.model !== DATA) {
            return {
                error: "This data type is for another model: " + dataType.model
            };
        }

        let validationSchema = {
            id: Joi.number().integer().positive(),
            type: Joi.number().integer().positive().required(),
            owner: Joi.number().integer().positive().required(),
            date: Joi.string().isoDate().allow(null),
            tags: Joi.array().allow(null),
            notes: Joi.string().allow(null),
            metadata: Joi.object().required(),
            files: Joi.array().items(Joi.object().keys({
                uri: Joi.string(),
                name: Joi.string(),
                details: Joi.object().allow(null),
                id: Joi.number().integer().positive(),
                createdAt: Joi.date(),
                updatedAt: Joi.date()
            })),
            parentSubject: Joi.number().integer().allow(null),
            parentSample: Joi.number().integer().allow(null),
            parentData: Joi.number().integer().allow(null),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };

        // validate metadata against metadata schema if skipMetadataValidation is set to false
        if (performMetadataValidation) {
            sails.log("Performing metadata validation: " + performMetadataValidation);
            let metadataValidationSchema = {
                __DATA: Joi.any()   // key to store any possible data object or "blob"
            };
            let flattenedFields = yield DataTypeService.getFlattenedFields(dataType);
            _.each(flattenedFields, field => {
                metadataValidationSchema[field.formattedName] = DataService.buildMetadataFieldValidationSchema(field);
            });
            validationSchema.metadata = Joi.object().required().keys(metadataValidationSchema);
            sails.log(validationSchema.metadata);
        }

        validationSchema = Joi.object().keys(validationSchema);
        return Joi.validate(data, validationSchema);
    }),

    filterOutSensitiveInfo: BluebirdPromise.coroutine(function* (data, canAccessSensitiveData) {
        if (!data || _.isEmpty(data)) {
            return [];
        }
        let arrData = [], idDataType, typeIds, forbiddenField, forbiddenFields  = [];
        _.isArray(data) ? arrData=data : arrData[0] = data;

      //retrive all unique idDatatypes from data Array
        typeof(arrData[0]['type']) === 'object' ?
        typeIds = _.uniq(_.map(_.uniq(_.map(arrData, 'type')), 'id')) :
        typeIds = _.uniq(_.map(arrData, 'type'));

      //retrieve datatypes of datum
        let dataTypes = yield DataType.find({select: ['id'], where: {id: typeIds}}).populate('superType');

          //if canAccessSensitiveData is true or metadata is Empty skip the function and return data
        if(!canAccessSensitiveData || (!_.isEmpty(arrData[0].metadata) && !arrData[1])){
            yield BluebirdPromise.each( dataTypes,co.wrap( function *(datatype) {

                //create an array with metadata fields sensitive for each dataType
                idDataType = datatype.id;
                let flattenedFields = yield DataTypeService.getFlattenedFields(datatype, false);
                forbiddenField = _.filter(flattenedFields, (field) => {return field.sensitive;});
                forbiddenFields[idDataType] = _.map(forbiddenField, (field) => {return field.formattedName;});

                for (let datum of arrData) {
                    _.each(forbiddenFields[datum.type], (forbField) => {
                        if(datum.metadata[forbField]){
                            delete datum.metadata[forbField];
                        }
                    });
                }
            }));

            return arrData.length > 1 ? arrData : arrData[0];
        }
        else {
            return data;
        }
    }),

    hasDataSensitive: BluebirdPromise.coroutine(function* (idData, modelName ) {

        let datum = yield global[modelName].findOne({id : idData}).populateAll();

        sails.log("DataService hasDataSensitive - called for model: " +  datum.type.model);
          //retrieve metadata fields sensitive
        const flattenedFields = yield DataTypeService.getFlattenedFields(datum.type, false);
        const forbiddenFields = _.filter(flattenedFields, field => { return field.sensitive; });

        const hasDataSensitive = forbiddenFields.length > 0;

        const json = {
            hasDataSensitive : hasDataSensitive,
            data : datum
        };
        return json;

    }),

    filterListByPrivileges:  BluebirdPromise.coroutine(function* (data, dataTypesId, privileges, canAccessSensitiveData) {
        // filter out privileges not pertaining the dataTypes we have
        const arrPrivileges = _.isArray(privileges) ? privileges : [privileges];
            //if operator has not at least a privilege on Data filter metadata
        if (!arrPrivileges || _.isEmpty(arrPrivileges) ){
            return [];
        }
        //or exists at least a VIEW_OVERVIEW privilege level filter metadata
        else if( arrPrivileges.length < dataTypesId.length ||
              (arrPrivileges.length === dataTypesId.length && _.find(arrPrivileges, { privilegeLevel: VIEW_OVERVIEW }))) {

            // check for each datum if operator has the privilege to view details. If not metadata object is cleaned
            let index = 0, arrDtPrivId = arrPrivileges.map(el => el.dataType);
            for ( let i = data.length - 1; i >= 0; i-- ) {
                let idDataType = _.isObject(data[i].type) ? data[i].type.id : data[i].type;
                index = arrDtPrivId.indexOf(idDataType);
                if( index < 0 ){
                    data.splice(i, 1);
                }
                else if (arrPrivileges[index].privilegeLevel === VIEW_OVERVIEW) { data[i].metadata = {}; }
            }
        }
        if( canAccessSensitiveData ){ return data; }
            //filter Out Sensitive Info if operator can not access to Sensitive Data
        let results = yield coroutines.filterOutSensitiveInfo(data, canAccessSensitiveData);
        return results;
    }),

    preprocessQueryParams: BluebirdPromise.coroutine(function* (queryArgs, idGroups, idDataType, next) {
        let dataTypes = [];
        let dataTypePrivileges = [];
        let forbiddenFields = [];
        let forbiddenMetadata = [];

        // CASE 4 leafSearch - multiProject
        if (queryArgs.multiProject && queryArgs.leafSearch) {
            [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata] = yield DataService.getDtAndPrivForMultiProjectAndLeafSearch(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType);
        }
        // CASE 3 multiProject
        else if (queryArgs.multiProject && !queryArgs.leafSearch) {
            [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata] = yield DataService.getDtAndPrivForMultiProject(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType, false);
        }
        // CASE 2 leafSearch
        else if (!queryArgs.multiProject && queryArgs.leafSearch) {
            [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata] = yield DataService.getDtAndPrivForLeafSearch(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType);
        }
        // CASE 1 no leafSearch e no multiProject
        else {
            dataTypes = yield DataType.findOne(idDataType).populate(['children','superType']);
            dataTypePrivileges = yield DataTypeService.getDataTypePrivilegeLevel(idGroups, idDataType);
            if (dataTypePrivileges && !_.isEmpty(dataTypePrivileges) && dataTypePrivileges.privilegeLevel !== VIEW_OVERVIEW) {
                let flattenedFields = yield DataTypeService.getFlattenedFields(dataTypes, false);
                let fFields = _.filter(flattenedFields, (field) => {return field.sensitive;});
                if (fFields && fFields.length > 0) {
                    forbiddenFields.push({
                        label: "metadata",
                        fields: fFields});
                }
            }
        }
        // console.log(dataTypes, dataTypePrivileges);
        let queryObj = queryBuilder.compose(queryArgs);
        sails.log("DataService.executeAdvancedQuery - query: " + queryObj.statement);
        sails.log(queryObj.parameters);

        return next(null ,{queryObj: queryObj, multiProject: queryArgs.multiProject, leafSearch: queryArgs.leafSearch, dataTypes: dataTypes, dataTypePrivileges: dataTypePrivileges, forbiddenFields: forbiddenFields, forbiddenMetadata: forbiddenMetadata});
    }),

    getDtAndPrivForMultiProjectAndLeafSearch: BluebirdPromise.coroutine(function* (queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType) {

        [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata] = yield DataService.getDtAndPrivForMultiProject(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType, true);

        let contents = queryArgs.content ? queryArgs.content : [];
        yield BluebirdPromise.each( contents, co.wrap( function *(content) {
            if (content.dataType) {
                [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata] = yield DataService.getDtAndPrivForMultiProjectAndLeafSearch(content, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, content.dataType);
            }
        }));
        return [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata];
    }),

    getDtAndPrivForMultiProject: BluebirdPromise.coroutine(function* (queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType, isLeafSearch) {
        if (idDataType) {
            let dt = yield DataType.findOne(idDataType).populate(['superType']);
            let dts = yield DataType.find({superType: dt.superType.id}).populate(['children','superType']);

            let created = false;
            yield BluebirdPromise.each( dts, co.wrap( function *(datatype,i) {
                let priv = yield DataTypeService.getDataTypePrivilegeLevel(idGroups, datatype.id);
                if(priv && !_.isEmpty(priv)){
                    if ( (queryArgs.multiProject || queryArgs.getMetadata) && priv.privilegeLevel !== VIEW_OVERVIEW ) {
                        if (!created) {
                            let flattenedFields = yield DataTypeService.getFlattenedFields(datatype, false);
                            let fFields = _.filter(flattenedFields, (field) => { return field.sensitive; });
                            if (fFields && fFields.length > 0) {
                                forbiddenFields.push({
                                    label: queryArgs.multiProject ? 'metadata' : datatype.name.toLowerCase().replace(/[||\-*/,=<>~!^()\ ]/g,"_"),
                                    fields: fFields});
                            }
                            created = true;
                        }
                    }
                    else if ((queryArgs.multiProject || queryArgs.getMetadata) && priv.privilegeLevel === VIEW_OVERVIEW) {
                        forbiddenMetadata.push({
                            label: queryArgs.multiProject ? 'metadata' : datatype.name.toLowerCase().replace(/[||\-*/,=<>~!^()\ ]/g,"_"),
                            project: datatype.project});
                    }
                    dataTypePrivileges.push(priv);
                }
                else {
                    dts.splice(i,1);
                }
            }));
            queryArgs.dataType = _.map(dts,'id');
            dts && !_.isEmpty(dts) && dataTypes.push(dts);
            dataTypes = _.flatten(dataTypes);
        }

        if (!isLeafSearch) {
            let contents = queryArgs.content ? queryArgs.content : [];
            yield BluebirdPromise.each( contents, co.wrap( function *(content) {
                if (content.dataType) {
                    [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata] = yield DataService.getDtAndPrivForMultiProject(content, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, content.dataType, false);
                }
            }));
        }
        return [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata];
    }),

    getDtAndPrivForLeafSearch: BluebirdPromise.coroutine(function* (queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType) {
        if (idDataType) {
            let d = yield DataType.findOne(idDataType).populate(['superType','children']);
            let p = yield DataTypeService.getDataTypePrivilegeLevel(idGroups, d.id);
            if(p && !_.isEmpty(p)){
                dataTypePrivileges.push(p);
                if (p.privilegeLevel !== VIEW_OVERVIEW) {
                    let flattenedFields = yield DataTypeService.getFlattenedFields(d, false);
                    let fFields = _.filter(flattenedFields, (field) => {return field.sensitive;});
                    if (fFields && fFields.length > 0) {
                        forbiddenFields.push({
                            label: queryArgs.leafSearch ? 'metadata' : d.name.toLowerCase().replace(/[||\-*/,=<>~!^()\ ]/g,"_"),
                            fields: fFields});
                    }
                }
                else if (p.privilegeLevel === VIEW_OVERVIEW) {
                    forbiddenMetadata.push({
                        label: queryArgs.leafSearch ? 'metadata' : d.name.toLowerCase().replace(/[||\-*/,=<>~!^()\ ]/g,"_"),
                        project: d.project});
                }
                dataTypes.push(d);
            }
        }

        let contents = queryArgs.content ? queryArgs.content : [];
        yield BluebirdPromise.each( contents, co.wrap( function *(content) {
            if (content.dataType) {
                [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata] = yield DataService.getDtAndPrivForLeafSearch(content, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, content.dataType);
            }
        }));
        return [dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata];
    })

};

let DataService = BluebirdPromise.promisifyAll({

    /**
     * @method
     * @name simplify
     * @description removes all associated Objects if present keeping only their primary keys (i.e. IDs)
     */
    simplify: function(data) {
        ["type", "parentSubject", "parentSample", "parentData"].forEach(elem => {
            if (data[elem]) {
                data[elem] = data[elem].id || data[elem];
            }
        });
    },

    /**
     * @method
     * @name validate
     * @param{Object} data - the data to be validated
     * @param{boolean} performMetadataValidation - if true perform the metadata validation
     * @param{Object} dataType - the dataType containing the schema aginst which the data's metadata are to be validated
     * @return {Object} - the result object contains two properties:
     *                      - error: null if the Data is validated, an Error object otherwise
     *                      - value: the validated data object if no error is returned
     */
    validate: function(data, performMetadataValidation, dataType) {
        return coroutines.validate(data, performMetadataValidation, dataType)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    },

    /**
     * @method
     * @name buildMetadataFieldValidationSchema
     * @description builds the JOI validation schema for a given metadata field
     * @param{Object} metadataField - the schema of the field
     * @return{Object} fieldValidatorSchema - the JOI validation schema for the field
     */
    buildMetadataFieldValidationSchema: function(metadataField) {
        let fieldValidatorSchema = Joi.object(), value, group;

        switch(metadataField.fieldType) {
            case FieldTypes.INTEGER:
                value = Joi.number().integer();
                break;
            case FieldTypes.FLOAT:
                value = Joi.number();
                break;
            case FieldTypes.BOOLEAN:
                value = Joi.boolean().default(false);
                break;
            case FieldTypes.DATE:
                value = Joi.string().isoDate();
                break;
            case FieldTypes.LINK:
                value = Joi.string().trim();
                break;
                // default is TEXT
            default:
                value = Joi.string();
                if (metadataField.caseInsensitive && !metadataField.isList) {
                    value = value.uppercase();
                }
        }

        if (metadataField.required) {
            fieldValidatorSchema = fieldValidatorSchema.required();
            value = value.required();
        }
        else {      // allow "null" value if value is not required
            value = value.allow(null);
        }

        if (metadataField.customValue) {
            value = value.default(metadataField.customValue);
        }

        if (metadataField.isList) {
            value = value.valid(metadataField.possibleValues);
        }

        group = Joi.string();

        if (metadataField._loop) {
            let values = Joi.array();
            if (metadataField.required) values = values.required();

            fieldValidatorSchema = fieldValidatorSchema.keys({
                values: values.items(value),
                group: group,
                loop: Joi.string()
            });
            if (metadataField.hasUnit) {
                let units = Joi.array().required();
                fieldValidatorSchema = fieldValidatorSchema.keys({
                    units: units.items(Joi.string().required().valid(metadataField.possibleUnits))
                });
                // TODO the length of values and units arrys must be equal
            }
        }

        else {
            fieldValidatorSchema = fieldValidatorSchema.keys({
                value: value,
                group: group
            });
            if (metadataField.hasUnit) {
                fieldValidatorSchema = fieldValidatorSchema.keys({
                    unit: Joi.string().required().valid(metadataField.possibleUnits)
                });
            }
        }

        return fieldValidatorSchema;
    },

    /**
     * @method
     * @name getOne
     * @description return a data instance, given its id and populate all its associations
     * @param {integer} id
     * @param {function} next - callaback function
     */
    getOne: function(id, next) {
        if (!id) {
            next(null, null);
        }
        else {
            Data.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    },

    /**
     * @method
     * @name preprocessQueryParams
     * @param{Object} queryArgs - a nested object containing all the query arguments
     * @param{Array - integer} idGroups - an array containg the operator's groups
     * @param{integer} idDataType - id Data Type
     * @return{Promise} promise with all parameters needed for the query
     */
    preprocessQueryParams: function(queryArgs, idGroups, idDataType, next) {
        return coroutines.preprocessQueryParams(queryArgs, idGroups, idDataType, next)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });

    },

    /**
     * @method
     * @name getDtAndPrivForMultiProjectAndLeafSearch
     * @param{Object} queryArgs - a nested object containing all the query arguments
     * @param{Array - integer} idGroups - an array containg the operator's groups
     * @param{integer} idGroups - Operator's groups
     * @param{Array} dataTypes - list of all Data Types
     * @param{Array} dataTypePrivileges - list of all privileges
     * @param{integer} idDataType - id Data Type
     * @return{Promise} promise with all parameters needed for the query
     */
    getDtAndPrivForMultiProjectAndLeafSearch: function(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType) {
        return coroutines.getDtAndPrivForMultiProjectAndLeafSearch(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });

    },

    /**
     * @method
     * @name getDtAndPrivForMultiProject
     * @param{Object} queryArgs - a nested object containing all the query arguments
     * @param{Array - integer} idGroups - an array containg the operator's groups
     * @param{integer} idGroups - Operator's groups
     * @param{Array} dataTypes - list of all Data Types
     * @param{Array} dataTypePrivileges - list of all privileges
     * @param{integer} idDataType - id Data Type
     * @return{Promise} promise with all parameters needed for the query
     */
    getDtAndPrivForMultiProject: function(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType, isLeafSearch) {
        return coroutines.getDtAndPrivForMultiProject(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType, isLeafSearch)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });

    },

    /**
     * @method
     * @name getDtAndPrivForLeafSearch
     * @param{Object} queryArgs - a nested object containing all the query arguments
     * @param{Array - integer} idGroups - an array containg the operator's groups
     * @param{integer} idGroups - Operator's groups
     * @param{Array} dataTypes - list of all Data Types
     * @param{Array} dataTypePrivileges - list of all privileges
     * @param{integer} idDataType - id Data Type
     * @return{Promise} promise with all parameters needed for the query
     */
    getDtAndPrivForLeafSearch: function(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType) {
        return coroutines.getDtAndPrivForLeafSearch(queryArgs, idGroups, dataTypes, dataTypePrivileges, forbiddenFields, forbiddenMetadata, idDataType)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });

    },

    /**
     * @name filterOutSensitiveInfo
     * @description Filter data
     * @param {Array} - an array of data
     * @param {dataTypes} - an array of dataType
     * @return {Promise} -  a Bluebird Promise with Data Array filtered
     */
    filterOutSensitiveInfo: function(data, canAccessSensitiveData) {
        return coroutines.filterOutSensitiveInfo(data, canAccessSensitiveData)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    },

    /**
     * @name hasDataSensitive
     * @description Return a boolean true if data has sensitive attributes, then false
     * @param {integer, string} - identifier of data, model Name of data
     * @return {Promise} -  a Bluebird Promise with an object containing boolean value of investigation and data
     */
    hasDataSensitive: function(idData, modelName) {
        return coroutines.hasDataSensitive(idData, modelName)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    },

    /**
    * @method
    * @name executeAdvancedQuery
    * @param{Object} queryArgs - a nested object containing all the query arguments
    * @return{Promise} promise with argument a list of retrieved items matching the query
    */
    executeAdvancedQuery: function(processedArgs, operator, next) {
        const dataTypes = processedArgs.dataTypes,
            dataTypePrivileges = processedArgs.dataTypePrivileges,
            queryObj = processedArgs.queryObj,
            forbiddenFields = processedArgs.forbiddenFields,
            forbiddenMetadata = processedArgs.forbiddenMetadata,
            multiProject = processedArgs.multiProject,
            leafSearch = processedArgs.leafSearch;

        crudManager.query(queryObj, (err, results) => {
            if (err) {
                sails.log(err);
                return next(err, null);
            }
            let data = results.rows;
            _.forEach(data, (datum, i) => {

                // console.log(dataTypePrivileges, datum.type);
                let priv = multiProject || leafSearch ? _.find(dataTypePrivileges,{'dataType': datum.type}) : dataTypePrivileges;

              //if operator has not privilege on dataTypes return empty data
                if (!priv || _.isEmpty(priv) ) { data.splice(i,1); return;}

              /*istanbul ignore if*/
                else if( !operator.canAccessSensitiveData){
                  // _.forEach(forbiddenFields, forbiddenField => {
                    for (const forbiddenField of forbiddenFields) {
                        for (const field of forbiddenField.fields) {
                            multiProject ? datum[forbiddenField.label][field.formattedName] = null : delete datum[forbiddenField.label][field.formattedName];
                        }
                    }
                }
                if (forbiddenMetadata.length > 0) {
                    let dt = multiProject || leafSearch ? _.find(dataTypes,{'id': datum.type}) : dataTypes;
                    for (const frbMtdt of forbiddenMetadata) {
                        if (dt.project === frbMtdt.project) {
                            datum[frbMtdt.label] = {};
                        }
                    }
                }else if (!multiProject && !leafSearch && priv && priv.privilegeLevel === VIEW_OVERVIEW) {
                    datum['metadata'] = {};
                }
            });
            // console.log(data);
            const json = {data: data, dataTypes: dataTypes, dataTypePrivileges : dataTypePrivileges };
            return next(null, json);

        });
    },

    /**
     * @method
     * @name executeAdvancedStreamQuery
     * @description Return a stream of data
     * @param {object} - contains all required params to perfom the db query
     * @return {Promise} -  a stream of data containing all rows satisfating the query
     */
    executeAdvancedStreamQuery: function(processedArgs, operator, next) {
        const dataTypes = processedArgs.dataTypes,
            dataTypePrivileges = processedArgs.dataTypePrivileges,
            queryObj = processedArgs.queryObj,
            forbiddenFields = processedArgs.forbiddenFields,
            forbiddenMetadata = processedArgs.forbiddenMetadata,
            multiProject = processedArgs.multiProject,
            leafSearch = processedArgs.leafSearch;

        return crudManager.queryStream(queryObj, stream => {

            stream.once('data', () => {
                stream.pause();
                stream.push({dataTypePrivileges: dataTypePrivileges});
                stream.push({dataTypes: dataTypes});
                stream.resume();
            });

            stream.on('end', () => {
                sails.log('Stream ended');
                stream.close();
            });

            stream.on('error', err => {
                sails.log('Error Stream: ', err.toString());
            });

            stream.on('data', chunk => {
                if(chunk.dataTypes || chunk.dataTypePrivileges) { return chunk; }

                let priv = multiProject || leafSearch ? _.find(dataTypePrivileges,{'dataType': chunk.type}) : dataTypePrivileges;

                //if operator has not privilege on dataTypePrivileges return empty data
                if (!priv || _.isEmpty(priv) ) {
                    for(let i in chunk){
                        delete chunk[i];
                    }
                }
                // else if( priv.privilegeLevel === VIEW_OVERVIEW) { chunk.metadata = {}; }
                /*istanbul ignore if*/
                else if( !operator.canAccessSensitiveData ) {
                    for (const forbiddenField of forbiddenFields) {
                        for (const field of forbiddenField.fields) {
                            multiProject ? chunk[forbiddenField.label][field.formattedName] = null : delete chunk[forbiddenField.label][field.formattedName];
                        }
                    }
                }
                if (forbiddenMetadata.length > 0) {
                    let dt = multiProject || leafSearch ? _.find(dataTypes,{'id': chunk.type}) : dataTypes;
                    for (const frbMtdt of forbiddenMetadata) {
                        if (dt.project === frbMtdt.project) {
                            chunk[frbMtdt.label] = {};
                        }
                    }
                }
                else if (!multiProject && !leafSearch && priv && priv.privilegeLevel === VIEW_OVERVIEW) {
                    chunk['metadata'] = {};
                }

                return chunk;
            });

            return next(null, stream);
        });

    },

    /**
     * @method
     * @name filterListByPrivileges
     * @description filters the metadata of a list of data entities on the basis of the user privileges
     * @param{Array} data - the array to be filtered
     * @param{Array} dataTypesId -
     * @param{Array/Object} privileges
     * @param{boolean} canAccessSensitiveData
     * @return {Promise} - a Bluebird promise returning an Array with the filtered data
     */
    filterListByPrivileges: function(data, dataTypesId, privileges, canAccessSensitiveData) {
        return coroutines.filterListByPrivileges(data, dataTypesId, privileges, canAccessSensitiveData)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    },

    /**
     * @method
     * @name prepareAndSendResponse
     * @param{HTTPResponse} res
     * @param{Array} data - the body of the response
     * @param{Object} headerInfo
     * @return sends the response
     */
    prepareAndSendResponse: function(res, data, headerInfo) {
        const linkArr = [];
        res.set('Access-Control-Expose-Headers', [
            'X-Total-Count', 'X-Page-Size', 'X-Total-Pages', 'X-Current-Page', 'Link'
        ]);
        for (const elem of headerInfo.links) {
            const { value: link , rel } = elem;
            if (link) {
                linkArr.push(`<${link}>; rel=${rel}`);
            }
        }
        res.set({
            'X-Total-Count': headerInfo.count,
            'X-Page-Size': headerInfo.pageSize,
            'X-Total-Pages': headerInfo.numPages,
            'X-Current-Page': headerInfo.currPage,
            'Link': linkArr.join(', ')
        });
        return res.json(data);
    },

    /**
     * @name storeMetadataIntoEAV
     * @description insert in the EAV catalogue a certain number of Data (Subject or Sample) instances
     * @param {Integer/Array} - an integer or an array of identifiers
     * @param {modelName} - an optional name determining on which table run the query
     * @return {Promise} -  a Bluebird Promise
     */
    storeMetadataIntoEAV: /*istanbul ignore next*/ function(ids, modelName) {
        sails.log.info(`ids are: ${ids}`);
        sails.log.info(`Is ids an array? ${_.isArray(ids) ? 'YES' : 'NO'}`);
        modelName = modelName || DATA;
        return global[modelName].find({id: ids}).then(function(foundData) {
            sails.log.info(foundData);
            sails.log("DataService.storeMetadataIntoEAV - EAV value table map is: " + sails.config.xtens.constants.EavValueTableMap);
            return BluebirdPromise.map(foundData, function(datum) {
                return crudManager.putMetadataValuesIntoEAV(datum, sails.config.xtens.constants.EavValueTableMap);
            }, {concurrency: 100});
        })

        .then(function(inserted) {
            sails.log("DataService.storeMetadataIntoEAV - new rows inserted: " + inserted.length);
        })

        .catch(function(error) {
            sails.log.error(error);
            sails.log.error("DataService.storeMetadataIntoEAV - error caught");
        });

    },

    /**
     * TODO
     * @method
     * @name storeEAVAll
     * @description populates the whole metadata catalogue
     * @
     */
    storeEAVAll: /*istanbul ignore next*/ function(limit) {
        let offset = 0;
        limit = limit || 100000;

        let modelName = arguments.length < 2 ? 'data' :
            (arguments[1].toLowerCase() === 'subject' || arguments[1].toLowerCase() === 'sample') ? arguments[1].toLowerCase() : 'data';
        sails.log("modelName: " + modelName);

        let query = BluebirdPromise.promisify(Data.query, Data);

        return query("SELECT count(*) FROM " + modelName +  ";")

        .then(function(res) {
            let count = res.rows[0].count;
            sails.log("total count is: " + count);
            let iterations = Math.ceil(count/limit);
            sails.log("iterations: " + iterations);
            return BluebirdPromise.map(new Array(iterations), function() {
                sails.log("offset: " + offset);
                sails.log("limit: " + limit);
                return query("SELECT id FROM " + modelName + " LIMIT $1 OFFSET $2", [limit,offset]).then(function(result) {
                    offset += limit;
                    let ids = _.map(result.rows, 'id');
                    // sails.log(ids);
                    return DataService.storeMetadataIntoEAV(ids);
                    // return;
                });
            }, {concurrency: 1});
        });
    }

});

module.exports = DataService;
