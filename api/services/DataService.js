/**
 *  @author Massimiliano Izzo
 */
var http = require('http');
var queryBuilder = sails.config.xtens.queryBuilder;
var irodsRestUrl = sails.config.xtens.irods.irodsRest;

var rule = [
    'xtensFileMove {',
    'msiCollCreate(str(*irodsHome)++"/"++str(*repoColl)++"/"++str(*dataTypeName)++"/"++str(*idData), "1", *status) ::: msiRollback;',
    '*destination = str(*irodsHome)++"/"++str(*repoColl)++"/"++str(*dataTypeName)++"/"++str(*idData)++"/"++str(*fileName);',
    'writeLine("serverLog", "destination is *destination");',
    'msiDataObjRename(*source, *destination, "0", *status);',
    '}',
    'INPUT *irodsHome = "/biolabZone/home/superbiorods", *source="void.txt", *fileName = "void.txt", *dataTypeName = "none", *repoColl="test-repo", *idData = 0',
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

    moveFiles:function(files, next) {
        var url = irodsRestUrl + "/rule";
        async.each(files,function(file, callback){ 
            this.moveFile(file, callback);
        }, function(err) {
            if (err) {
                next(err);
            } else {
                next();
            }
        });
    },

    moveFile: function(file, idData, dataTypeName, callback) {
        // console.log(file.uri);
        // var file.uri.split("/"));
        var fileName = _.last(file.uri.split("/"));
        console.log(fileName);

        var irodsRuleInputParameters = [
            {name: "*irodsHome", value: sails.config.xtens.irods.irodsHome},
            {name: "*repoColl", value: sails.config.xtens.irods.repoColl},
            {name: "*dataTypeName", value: dataTypeName},
            {name: "*idData", value: idData},
            {name: "*fileName", value: fileName},
            {name: "*source", value: file.uri}
        ];

        var postOptions = {
            hostname:'130.251.10.60',
            port:8080,
            path:'/irods-rest-4.0.2.1-SNAPSHOT/rest/rule',
            method:'POST', 
            auth:'superbiorods:superbio05!',
            headers: {
                'Content-Type': 'application/json'
            } 
        };

        var postRequest = http.request(postOptions,function(res) {
            res.setEncoding('utf8');
        });

        postRequest.on('error',function(err) {
            console.log('problem with request: ' + err.message);
            callback(err);
        });

        postRequest.on('success', function(res) {
            /* TODO see if this works this way */
            if (!file.data) {
                file.data = [];
            }
            file.data.add(idData); 
            file.uri = sails.config.xtens.irods.irodsHome + "/" + sails.config.xtens.irods.repoColl + "/" + dataTypeName + "/" + idData + "/" + fileName;
            /* end TODO */
            callback();
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
    
    }

};
module.exports = DataService;
