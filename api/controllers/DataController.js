/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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

        var data = _.omit(req.allParams(), 'files');
        var files = req.param('files');
        async.auto({
            begin_transaction: function(callback) {
                Data.query('BEGIN TRANSACTION;', callback);
            },
            datum: ['begin_transaction',function(callback) {
                Data.create(data).exec(callback);
            }],
            data_type: ['begin_transaction', 'datum', function(callback, results) {
                DataType.findOne({id: results.datum.type}).exec(callback);
            }],
            renamed_files: ['data_type','datum', function(callback, results) {
                var id = results.datum.id;
                var dataTypeName = results.data_type && results.data_type.name;
                if (!dataTypeName) {
                    throw new Error("missing DataType name");
                }
                DataService.moveFiles(files, id, dataTypeName, callback);
            }],
            saved_files: ['datum', 'renamed_files', function(callback, results) {
                console.log(files);
                DataFile.create(files).exec(callback);
            }],
            populated_data: ['datum', 'saved_files', function(callback, results) {
                Data.findOne(results.datum.id).populateAll().exec(function(err, found) {
                    results.saved_files.forEach(function(file) {
                        found.files.add(file);
                    });
                    console.log(found);
                    Data.update(found.id, found).exec(function(e,r) {
                        if (e) {
                            callback(e);
                        }
                        Data.findOne(found.id).populateAll().exec(callback);
                    });
                });
            }]
        }, function(error, results) {
            if (error) {
                console.log(error.message);
                Data.query('ROLLBACK;', function(e, r) {
                    return res.serverError(err.message);
                });
            }
            Data.query('COMMIT;', function(e, r) {
                if (e) {
                    return res.serverError("Error during commit");
                }
                return res.json(results.populated_data);
            });
        });

    }

};

