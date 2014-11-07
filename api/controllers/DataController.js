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
                /*
                var id = _.parseInt(params.id);
                if(!id || _.isNaN(id)) {
                    callback(null, null);
                }
                else {
                    Data.findOne(params.id).populateAll().exec(callback);
                } */
            },

            dataTypes: function(callback) {
                DataTypeService.getAsync(callback, params);
            },
            
            parentSubject: function(callback) {
                SubjectService.getOneAsync(callback, params.parentSubject);
                /*
                if (!params.parentSubject) {
                    callback(null, null);
                }
                else {
                    Subject.findOne(_.parseInt(params.parentSubject)).populateAll().exec(callback);
                } */
            },

            parentSample: function(callback) {
                SampleService.getOneAsync(callback, params.parentSample);
                /*
                if (!params.parentSample) {
                    callback(null, null);
                }
                else {
                    Sample.findOne(_.parseInt(params.parentSample)).populateAll().exec(callback);
                } */
            },

            parentData: function(callback) {
                DataService.getOneAsync(callback, params.parentData);
                /*
                if (!params.parentData) {
                    callback(null, null);
                }
                else {
                    Data.findOne(_.parseInt(params.parentData)).populateAll().exec(callback);
                }*/
            }

        }, function(err, results) {
            if (err) {
                return res.serverError(err);
            }
            return res.json(results);
            
        });

    }
	
};

