/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;

module.exports = {

    edit: function(req, res) {

        var params = req.allParams();
        params.classTemplate = "Generic";

        async.parallel({

            data: function(callback) {
                DataService.getOneAsync(callback, params.id);
            },

            dataTypes: function(callback) {
                DataTypeService.getAsync(callback, params);
            },

            parentSubject: function(callback) {
                SubjectService.getOneAsync(callback, params.parentSubject);
            },

            parentSample: function(callback) {
                SampleService.getOneAsync(callback, params.parentSample);
            },

            parentData: function(callback) {
                DataService.getOneAsync(callback, params.parentData);
            }

        }, function(err, results) {
            if (err) {
                return res.serverError("error");
            }
            return res.json(results);

        });

    },

    create: function(req, res) {
        var data = req.body;
        DataType.findOne(data.type)
        .then(function(dataType) {
            var dataTypeName = dataType && dataType.name;
            return transactionHandler.createData(data, dataTypeName);
        })
        .then(function(idData) {
            console.log(idData);
            return Data.findOne(idData).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
            return res.serverError(err.message);
        });
    },
    
    /* 
    create: function(req, res) {

        var data = req.body;
        var files = data.files;
        async.auto({  
            data_type: function(callback, results) {
                var type = data.type;
                if (type.name) {
                    callback(null, type);
                }
                else {
                    DataType.findOne(_.pick(data.type, 'id')).exec(callback);
                }
            },
            renamed_files: ['data_type', function(callback, results) {
                var dataTypeName = results.data_type && results.data_type.name;
                if (!dataTypeName) {
                    throw new Error("missing DataType name");
                }
                DataService.moveFiles(files, null, dataTypeName, callback);
            }],
            created_data: ['renamed_files', function(callback, results) {
                Data.create(data).exec(callback);            
            }],
            data: ['created_data', function(callback, results) {
                Data.findOne(_.pick(results.created_data, 'id')).populateAll().exec(callback);
            }]
        }, function(error, results) {
            if (error) {
                console.log(error.message);
                return res.serverError(err.message);
            }
            return res.json(results.data);
        });

    } */

};

