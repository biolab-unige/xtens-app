/**
 *  @author Massimiliano Izzo
 */
var http = require('http');
var queryBuilder = sails.config.xtens.queryBuilder;
var irodsConf = sails.config.xtens.irods;

var rule = [
    'xtensFileMove {',
    'msiCollCreate(str(*irodsHome)++"/"++str(*repoColl)++"/"++str(*dataTypeName)++"/"++str(*idData), "1", *status) ::: msiRollback;',
    '*source = str(*irodsHome)++"/"++str(*landingColl)++"/"++str(*fileName)',
    'writeLine("serverLog", "source is *source")',
    '*destination = str(*irodsHome)++"/"++str(*repoColl)++"/"++str(*dataTypeName)++"/"++str(*idData)++"/"++str(*fileName);',
    'writeLine("serverLog", "destination is *destination");',
    'msiDataObjRename(*source, *destination, "0", *status);',
    '}',
    'INPUT *irodsHome = "/biolabZone/home/superbiorods", *landingColl="land", *fileName = "void.txt", *dataTypeName = "none", *repoColl="test-repo", *idData = 0',
    'OUTPUT *ruleExecOut'
].join('\r\n');

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
        Data.query(query.statement, query.parameters, next);
    },

    queryAndPopulateItemsById: function(next, foundRows, classTemplate) {
        var ids = _.pluck(foundRows, 'id');
        switch(classTemplate) {
            case "Subject":
                Subject.find({id: ids}).populateAll().exec(next);
            break;
            case "Sample":
                Sample.find({id: ids}).populateAll().exec(next);
            break;
            default:
                Data.find({id: ids}).populateAll().exec(next);
        }
    },

    moveFiles:function(files, id, dataTypeName, next) {
        async.each(files,function(file, callback){ 
            DataService.moveFile(file, id, dataTypeName, callback);
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

    moveFile: function(file, idData, dataTypeName, callback) {
        console.log(file.name);

        var irodsRuleInputParameters = [
            {name: "*irodsHome", value: irodsConf.irodsHome},
            {name: "*dataTypeName", value: dataTypeName},
            {name: "*idData", value: idData},
            {name: "*fileName", value: file.name},
            {name: "*landingColl", value: irodsConf.landingColl},
            {name: "*repoColl", value: irodsConf.repoColl}
        ];

        var postOptions = {
            hostname: irodsConf.irodsRest.hostname,
            port: irodsConf.irodsRest.port,
            path: irodsConf.irodsRest.path + '/rule',
            method: 'POST', 
            auth: irodsConf.username+':'+irodsConf.password,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            } 
        };

        var postRequest = http.request(postOptions,function(res) {
            res.setEncoding('utf8');

            var resBody = '';

            res.on('data', function(chunk) {
                resBody += chunk;
            });

            res.on('end', function() {
                console.log('res.end');
                console.log(resBody); 
                file.uri = irodsConf.irodsHome + "/" + irodsConf.repoColl + "/" + dataTypeName + "/" + idData + "/" + file.name;
                delete file.name;
                console.log(file);
                console.log("irods.moveFile: success...calling callback");
                callback();
            });
        });

        postRequest.on('error',function(err) {
            console.log('irods.moveFile: problem with request: ' + err.message);
            callback(err);
        });

        var body = {
            ruleProcessingType: "INTERNAL",
            ruleAsOriginalText: rule,
            irodsRuleInputParameters: irodsRuleInputParameters
        };

        postRequest.write(JSON.stringify(body));
        postRequest.end();

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


    },

    /* test function for update with populate 
    testUpdate: function(id) {
        Data.findOne(3).populateAll().exec(function(err, res) {
            if (err) {
                console.log(err);
            }
            
        });
    } */

};
module.exports = DataService;
