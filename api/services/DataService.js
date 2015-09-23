/**
 *  @author Massimiliano Izzo
 */
var http = require('http');
var BluebirdPromise = require('bluebird');
var queryBuilder = sails.config.xtens.queryBuilder;
var DataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
var FieldTypes = sails.config.xtens.constants.FieldTypes;
var fileSystemManager = sails.config.xtens.fileSystemManager;
var transactionHandler = sails.config.xtens.transactionHandler;
var Joi = require('joi');

var DataService = BluebirdPromise.promisifyAll({

    /**
     * @method
     * @name simplify
     * @description removes all associated Objects if present keeping only their primary keys (i.e. IDs)
     */
    simplify: function(data) {
        ["type", "parentSubject", "parentSample", "parentData"].forEach(function(elem) {
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

        var validationSchema = {
            id: Joi.number().integer().positive(),
            type: Joi.number().integer().positive().required(),
            date: Joi.date().iso().allow(null),
            tags: Joi.array().allow(null),
            notes: Joi.string().allow(null),
            metadata: Joi.object().required(),
            files: Joi.array(),
            parentSubject: Joi.number().integer(),
            parentSample: Joi.number().integer(),
            parentData: Joi.number().integer(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        };

        // validate metadata against metadata schema if skipMetadataValidation is set to false
        if (performMetadataValidation) {
            console.log("Performing metadata validation: " + performMetadataValidation);
            var metadataValidationSchema = {};
            var flattenedFields = DataTypeService.getFlattenedFields(dataType);
            _.each(flattenedFields, function(field) {
                metadataValidationSchema[field.formattedName] = DataService.buildMetadataFieldValidationSchema(field);
            });
            validationSchema.metadata = Joi.object().required().keys(metadataValidationSchema);
            console.log(validationSchema.metadata);
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
        var fieldValidatorSchema = Joi.object();

        var value, unit, group;

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
                value = Joi.date();
            break;
            default:
                value = Joi.string();
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
            values = Joi.array();
            if (metadataField.required) values = values.required();

            fieldValidatorSchema = fieldValidatorSchema.keys({
                values: values.items(value),
                group: group,
                loop: Joi.string()
            });
            if (metadataField.hasUnit) {
                units = Joi.array().required();
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
     * @name advancedQuery
     * @param{Object} queryArgs - a nested object containing all the query arguments
     * @param{function} next - callback function
     */
    advancedQuery: function(queryArgs, next) {
        var query = queryBuilder.compose(queryArgs);
        console.log(query.statement);
        console.log(query.parameters);
        // Using Prepared Statements for efficiency and SQL-injection protection
        // https://github.com/brianc/node-postgres/wiki/Client#method-query-prepared 
        Data.query({
            text: query.statement, 
            values: query.parameters
        }, next);
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
        var ids = _.pluck(foundRows, 'id');
        switch(model) {
            case DataTypeClasses.SUBJECT:
                console.log("calling Subject.find");
            Subject.find({id: ids}).exec(next);
            break;
            case DataTypeClasses.SAMPLE:
                console.log("calling Sample.find");
            Sample.find({id: ids}).exec(next);
            break;
            default:
                console.log("calling Data.find");
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
                console.log("moving to next(error)");
                next(err);
            } else {
                console.log("DataService.moveFiles - moving to next()");
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
        }, function(next) {
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
        modelName = modelName || 'Data';
        return global[modelName].find(ids).then(function(foundData) {
            console.log("DataService.storeMetadataIntoEAV - EAV value table map is: " + sails.config.xtens.constants.EavValueTableMap);
            return BluebirdPromise.map(foundData, function(datum) {
                return transactionHandler.putMetadataValuesIntoEAV(datum, sails.config.xtens.constants.EavValueTableMap);
            }, {concurrency: 100});
        })

        .then(function(inserted) {
            console.log("DataService.storeMetadataIntoEAV - new rows inserted: " + inserted.length);
        })

        .catch(function(error) {
            console.log(error);
            console.log("DataService.storeMetadataIntoEAV - error caught");
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
        var offset = 0; 
        limit = limit || 100000;

        var modelName = arguments.length < 2 ? 'data' : 
            (arguments[1].toLowerCase() === 'subject' || arguments[1].toLowerCase() === 'sample') ? arguments[1].toLowerCase() : 'data';
        console.log("modelName: " + modelName);

        var query = BluebirdPromise.promisify(Data.query, Data);

        return query("SELECT count(*) FROM " + modelName +  ";")

        .then(function(res) {
            var count = res.rows[0].count;
            console.log("total count is: " + count);
            var iterations = Math.ceil(count/limit);
            console.log("iterations: " + iterations);
            return BluebirdPromise.map(new Array(iterations), function() {
                console.log("offset: " + offset);
                console.log("limit: " + limit);
                return query("SELECT id FROM " + modelName + " LIMIT $1 OFFSET $2", [limit,offset]).then(function(result) {
                    offset += limit;
                    var ids = _.pluck(result.rows, 'id');
                    // console.log(ids);
                    return DataService.storeMetadataIntoEAV(ids);
                    // return;
                });
            }, {concurrency: 1});
        });
    }

});

module.exports = DataService;
