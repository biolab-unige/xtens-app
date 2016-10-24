/**
 *  @author Massimiliano Izzo
 */
/* jshint node: true */
/* globals _, sails, async, Data, DataFile, Sample, Subject, DataType, DataTypeService, SubjectService, SampleService, QueryService, TokenService */
"use strict";

let http = require('http');
let BluebirdPromise = require('bluebird');
let JSONStream = require('JSONStream');
let DataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
let FieldTypes = sails.config.xtens.constants.FieldTypes;
let fileSystemManager = sails.config.xtens.fileSystemManager;
let Joi = require('joi');
let crudManager = sails.config.xtens.crudManager;
let queryBuilder = sails.config.xtens.queryBuilder;
const DATA = sails.config.xtens.constants.DataTypeClasses.DATA;
const VIEW_OVERVIEW = sails.config.xtens.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;


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

        if (dataType.model !== DATA) {
            return {
                error: "This data type is for another model: " + dataType.model
            };
        }

        let validationSchema = {
            id: Joi.number().integer().positive(),
            type: Joi.number().integer().positive().required(),
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
            let flattenedFields = DataTypeService.getFlattenedFields(dataType);
            _.each(flattenedFields, field => {
                metadataValidationSchema[field.formattedName] = DataService.buildMetadataFieldValidationSchema(field);
            });
            validationSchema.metadata = Joi.object().required().keys(metadataValidationSchema);
            sails.log(validationSchema.metadata);
        }

        validationSchema = Joi.object().keys(validationSchema);
        return Joi.validate(data, validationSchema);

    },

    /**
     * @method
     * @name buildMetadataFieldValidationSchema
     * @description builds the JOI validation schema for a given metadata field
     * @param{Object} metadataField - the schema of the field
     * @return{Object} fieldValidatorSchema - the JOI validation schema for the field
     */
    buildMetadataFieldValidationSchema: function(metadataField) {
        let fieldValidatorSchema = Joi.object();

        let value, unit, group;

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
     * @name executeAdvancedQuery
     * @param{Object} queryArgs - a nested object containing all the query arguments
     * @return{Promise} promise with all parameters needed for the query
     */
    preprocessQueryParams: function(queryArgs, idOperator, idDataType, next) {
        let dataType, dataPrivilege;
        let queryObj = queryBuilder.compose(queryArgs);
        sails.log("DataService.executeAdvancedQuery - query: " + queryObj.statement);
        sails.log(queryObj.parameters);

        DataType.findOne(idDataType).populate('children')

         .then(result => {
             dataType = result;
             return DataTypeService.getDataTypePrivilegeLevel(idOperator, idDataType);
         })
         .then(dataTypePrivilege => {
             let flattenedFields = DataTypeService.getFlattenedFields(dataType, false);
             let forbiddenFields = _.filter(flattenedFields, (field) => {return field.sensitive;});
             dataPrivilege = dataTypePrivilege;

             return next(false,{queryObj: queryObj, dataType: dataType, dataTypePrivilege : dataPrivilege, forbiddenFields: forbiddenFields});
         })
         .catch(function (err) {
             sails.log(err);
             next(err,false);
         });

    },


    /**
     * @method
     * @name queryAndPopulateItemsById
     * @description given a list of items it retrieves them from the databases and
     *              (optionally) populates the existing associations
     * @param {Array} foundRows - an array of items. Each item must contain at least an identifier (id)
     *                for retrieval
     * @param {enum} model - (e.g. Subject, Sample or Generic)
     * @param {function} next - a callabck
     * @return {Array} the list of found and populated objects
     */

    queryAndPopulateItemsById: function(foundRows, model, next) {
        let ids = _.pluck(foundRows, 'id');
        switch(model) {
        case DataTypeClasses.SUBJECT:
            sails.log("calling Subject.find");
            Subject.find({id: ids}).exec(next);
            break;
        case DataTypeClasses.SAMPLE:
            sails.log("calling Sample.find");
            Sample.find({id: ids}).exec(next);
            break;
        default:
            sails.log("calling Data.find");
            Data.find({id: ids}).exec(next);
        }
    },

    /**
     * @method
     * @name moveFiles
     */
    moveFiles:function(files, id, dataTypeName, next) {
        async.each(files,function(file, callback){
            fileSystemManager.storeFile(file, id, dataTypeName, callback);
        }, function(err) {
            if (err) {
                sails.log("moving to next(error)");
                next(err);
            } else {
                sails.log("DataService.moveFiles - moving to next()");
                next();
            }
        });
    },

    /**
     * @method
     * @name saveFileEntities
     */
    saveFileEntities: function(files, next) {

        async.each(files, function(file, callback) {
            DataFile.create(file).exec(callback);
        }, function(err) {
            if (err) {
                next(err);
            }
            next();
        });

    },

    /**
     * @name storeMetadataIntoEAV
     * @description insert in the EAV catalogue a certain number of Data (Subject or Sample) instances
     * @param {Integer/Array} - an integer or an array of identifiers
     * @param {modelName} - an optional name determining on which table run the query
     * @return {Promise} -  a Bluebird Promise
     */
    storeMetadataIntoEAV: function(ids, modelName) {
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
    storeEAVAll: function(limit) {
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
                    let ids = _.pluck(result.rows, 'id');
                    // sails.log(ids);
                    return DataService.storeMetadataIntoEAV(ids);
                    // return;
                });
            }, {concurrency: 1});
        });
    },

    /**
     * @name filterOutSensitiveInfo
     * @description Filter data
     * @param {Array} - an array of data
     * @param {dataTypes} - an array of dataType
     * @return {Promise} -  a Bluebird Promise with Data Array filtered
     */
    filterOutSensitiveInfo: function(data, canAccessSensitiveData, datatype) {

        let arrData = [], idDataType, typeIds, flattenedFields,
            forbiddenField, forbiddenFields  = [];
        _.isArray(data) ? arrData=data : arrData[0] = data;

        //retrive all unique idDatatypes from data Array
        typeof(arrData[0]['type']) === 'object' ?
          typeIds = _.uniq(_.map(_.uniq(_.map(arrData, 'type')), 'id')) :
          typeIds = _.uniq(_.map(arrData, 'type'));

        //retrieve datatypes of datum
        return DataType.find({select: ['schema','id'], where: {id: typeIds}}).then(dataTypes => {

            //if canAccessSensitiveData is true or metadata is Empty skip the function and return data
            if(!canAccessSensitiveData || (!_.isEmpty(arrData[0].metadata) && !arrData[1])){
                _.each(dataTypes, (datatype) => {

                  //create an array with metadata fields sensitive for each dataType
                    idDataType = datatype.id;
                    flattenedFields = DataTypeService.getFlattenedFields(datatype, false);
                    forbiddenField = _.filter(flattenedFields, (field) => {return field.sensitive;});
                    forbiddenFields[idDataType] = _.map(forbiddenField, (field) => {return field.formattedName;});
                });

                for (let datum of arrData) {
                    _.each(forbiddenFields[datum.type], (forbField) => {
                        if(datum.metadata[forbField]){
                            // sails.log("Deleted field: " + datum.metadata[forbField]);
                            delete datum.metadata[forbField];
                        }
                    });
                }
                return arrData.length > 1 ? arrData : arrData[0];
            }
            else {
                return data;
            }
        })
        .catch((err) => {
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
    hasDataSensitive: function(id, modelName) {

        let hasDataSensitive;

        return global[modelName].findOne({id : id}).populateAll().then((datum) => {
            //if (!datum){ return BluebirdPromise.resolve(undefined);}
            sails.log("DataService hasDataSensitive - called for model: "+  datum['type'].model);
            //retrieve metadata fields sensitive
            let flattenedFields = DataTypeService.getFlattenedFields(datum['type'], false);
            let forbiddenFields = _.filter(flattenedFields, (field) => { return field.sensitive; });

            forbiddenFields.length > 0 ? hasDataSensitive = true : hasDataSensitive = false;

            let json = {
                hasDataSensitive : hasDataSensitive,
                data : datum
            };
            return json;
        })
        .catch((err) => {
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
        let dataType = processedArgs.dataType,
            dataPrivilege = processedArgs.dataTypePrivilege,
            queryObj = processedArgs.queryObj,
            forbiddenFields = processedArgs.forbiddenFields,
            data;

        crudManager.query(queryObj, (err, results) => {
            if (err){
                sails.log(err);
                return next(err,null);
            }
            data = results.rows;
            console.log(data);
          //if operator has not privilege on dataType return empty data
            if (!dataPrivilege || _.isEmpty(dataPrivilege) ){ data = []; }

          //else if operator has not at least Details privilege level delete metadata object
            else if( dataPrivilege.privilegeLevel === VIEW_OVERVIEW) {
                for (var datum of data) { datum['metadata'] = {}; }
                return data;
            }
            //else if operator can not access to Sensitive Data and datatype has Sensitive data, remove them.
            else if( forbiddenFields.length > 0 && !operator.canAccessSensitiveData){
                _.each(forbiddenFields, (forbField) => {
                    _.each(data, (datum) => {
                        if(datum.metadata[forbField.formattedName]){
                 //  sails.log("Deleted field: " + chunk.metadata[forbField.formattedName]);
                            delete datum.metadata[forbField.formattedName];
                        }
                    });
                });
            }

            let json = {data: data, dataType: dataType, dataTypePrivilege : dataPrivilege };

            return next(null,json);

        });
    },
    /**
     * @name queryStream
     * @description Return a stream of data
     * @param {object} - contains all required params to perfom the db query
     * @return {Promise} -  a stream of data containing all rows satisfating the query
     */
    executeAdvancedStreamQuery: function(processedArgs, operator, next) {
        let dataType = processedArgs.dataType,
            dataPrivilege = processedArgs.dataTypePrivilege,
            queryObj = processedArgs.queryObj,
            forbiddenFields = processedArgs.forbiddenFields;
        let count = 0;
        return crudManager.queryStream(queryObj, stream => {

            stream.once('data', () => {
                stream.pause();
                stream.push({dataPrivilege: dataPrivilege});
                stream.push({dataType: dataType});
                stream.resume();
            });

            stream.on('end', () => {
                sails.log('Stream ended');
                console.log(count);
                stream.close();
            });

            stream.on('error', (err) => {
                sails.log('Error Stream: ', err.toString());
            });

            stream.on('data',chunk => {
                count = count +1;
                if(chunk.dataType || chunk.dataPrivilege){ return; }

                if (!dataPrivilege || _.isEmpty(dataPrivilege) ) { return; }

                else if( dataPrivilege.privilegeLevel === VIEW_OVERVIEW) { chunk.metadata = {}; }

              else if( forbiddenFields.length > 0 && !operator.canAccessSensitiveData){
                  _.each(forbiddenFields, (forbField) => {
                      if(chunk.metadata[forbField.formattedName]){
                     //  sails.log("Deleted field: " + chunk.metadata[forbField.formattedName]);
                          delete chunk.metadata[forbField.formattedName];
                      }
                  });
              }

            });
            return next(null, stream);
        });

    }


});

module.exports = DataService;
