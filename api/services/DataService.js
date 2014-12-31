/**
 *  @author Massimiliano Izzo
 */
var http = require('http');
var queryBuilder = sails.config.xtens.queryBuilder;
var DataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
var fileSystemManager = sails.config.xtens.fileSystemManager;

var DataService = {

    getOne: function(next, id) {
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
     * @param{function} next - callback function
     * @param{Object} queryArgs - a nested object containing all the query arguments
     */
    advancedQuery: function(next, queryArgs) {
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

    queryAndPopulateItemsById: function(next, foundRows, classTemplate) {
        var ids = _.pluck(foundRows, 'id');
        switch(classTemplate) {
            case DataTypeClasses.SUBJECT:
                console.log("calling Subject.find");
                Subject.find({id: ids}).populateAll().exec(next);
            break;
            case DataTypeClasses.SAMPLE:
                console.log("calling Sample.find");
                Sample.find({id: ids}).populateAll().exec(next);
            break;
            default:
                console.log("calling Data.find");
                Data.find({id: ids}).populateAll().exec(next);
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

    }
    
};
module.exports = DataService;
