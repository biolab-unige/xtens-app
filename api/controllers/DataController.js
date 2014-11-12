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

    }

};

