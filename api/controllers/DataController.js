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
                Data.query('BEGIN TRANSACTION', callback);
            },
            datum: ['begin_transaction',function(callback) {
                Data.create(data).exec(callback);
            }],
            moved_files: ['begin_transaction','datum', function(callback, results) {
                var id = results.datum.id;
                var dataTypeName = data.type && data.type.name;
                if (!dataTypeName) {
                    throw new Error("missing DataType name");
                }
                DataService.moveFiles(files, id, dataTypeName, callback);
            }],
            saved_files: ['begin_transaction','datum', 'moved_files', function(callback, results) {
                DataService.saveFileEntities(files, callback);
            }],
            created_data: ['begin_transaction','datum', 'moved_files', 'saved_files', function(callback, results) {
                Data.findOne(results.datum.id).populateAll().exec(callback);
            }]
        }, function(err, results) {
            if (err) {
                Data.query('ROLLBACK', next);
                return res.serverError(err.message);
            }
            Data.query('COMMIT', next);
            return res.json(results.created_data);
        });

    }

};

