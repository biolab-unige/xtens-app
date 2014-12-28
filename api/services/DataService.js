/**
 *  @author Massimiliano Izzo
 */
var http = require('http');
var queryBuilder = sails.config.xtens.queryBuilder;
var DataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
var fileSystemManager = sails.config.xtens.fileSystemManager;

var DataService = {

    getOneAsync: function(next, id) {
        if (!id) {
            next(null, null);
        }
        else {
            Data.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    },

    advancedQueryAsync: function(next, queryArgs) {
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
    
    /*
    retrieveFiles: function(files, next) {
        
        async.each(files, function(file, callback) {
            DataService.retrieveFile(file).exec(callback);
        }, function(next) {
            if(err) {
                next(err);
            }
            next();
        });

    },
    
   TODO: MOVE THIS FUNCTION TO xtens-fs module

    retrieveFile: function(file, callback) {
        
        var postOptions = {
            hostname: irodsConf.irodsRest.hostname,
            port: irodsConf.irodsRest.port,
            path: irodsConf.irodsRest.path + '/dataObject' + file.uri,
            method: 'GET', 
            auth: irodsConf.username+':'+irodsConf.password,
            headers: {
                'Accept': 'application/json'
            } 
        };

        var postRequest = http.request(postOptions,function(res) {
            
            console.log("method path: " + postOptions.path);
            res.setEncoding('utf8');
            var resBody = '';

            res.on('data', function(chunk) {
                resBody += chunk;
            });

            res.on('end', function() {
                console.log('res.end');
                console.log(resBody); 
                file.details = resBody;
                console.log(file);
                console.log("irods.retrieveFile: success...calling callback");
                callback();
            });
        });

        postRequest.on('error',function(err) {
            console.log('irods.retrieveFile: problem with request: ' + err.message);
            callback(err);
        });

        postRequest.end();


    } */

};
module.exports = DataService;
