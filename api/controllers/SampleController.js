/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;

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

            biobanks: function(callback) {
                BiobankService.getAsync(callback, params);
            },

            donor: function(callback) {
                SubjectService.getOne(callback, params.donor);
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
    
    },

    /**
     *  @description: POST /sample: create a new sample; implementation based on 
     *  Bluebird Promises + knex (transaction-support)
     */
    create: function(req, res) {
        var sample = req.body;
        DataType.findOne(data.type)
        .then(function(sampleType) {
            var sampleTypeName = sampleType && sampleType.name;
            return transactionHandler.createSample(sample, sampleTypeName);
        })
        .then(function(idSample) {
            console.log(idSample);
            return Sample.findOne(idSample).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
            return res.serverError(error.message);
        });
    }
	
};

