/**
 *  @author Massimiliano Izzo
 */
var http = require('http');
var BluebirdPromise = require('bluebird');
var queryBuilder = sails.config.xtens.queryBuilder;
var DataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
var fileSystemManager = sails.config.xtens.fileSystemManager;
var transactionHandler = sails.config.xtens.transactionHandler;

var DataService = BluebirdPromise.promisifyAll({

    
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
