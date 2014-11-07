/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    edit: function(req, res) {

        var params = req.allParams();
        params.classTemplate = "Sample";

        async.parallel({

            sample: function(callback) {
                SampleService.getOneAsync(callback, params.id);   
            },

            dataTypes: function(callback) {
                DataTypeService.getAsync(callback, params);
            },

            donor: function(callback) {
                SubjectService.getOneAsync(callback, params.donor);
            },

            parentSample: function(callback) {
                SampleService.getOneAsync(callback, params.parentSample);
            }
        
        }, function(error, results) {
            if (error) {
                return res.serverError(error);
            }
            return res.json(results);
        });
    
    }
	
};

