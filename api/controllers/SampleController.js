/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;

module.exports = {
    
    /**
     * @method
     * @name edit
     * @description retrieve all required models for editing/creating a Sample via client web-form
     */
    edit: function(req, res) {

        var params = req.allParams();
        params.classTemplate = "Sample";
        var idOperator = req.session.operator && req.session.operator.id;

        async.parallel({

            sample: function(callback) {
                SampleService.getOne(callback, params.id);   
            },

            dataTypes: function(callback) {
                // DataTypeService.get(callback, params);
                DataTypeService.getByOperator(idOperator, params, callback);
            },

            biobanks: function(callback) {
                BiobankService.get(callback, params);
            },

            donor: function(callback) {
                SubjectService.getOne(callback, params.donor);
            },

            parentSample: function(callback) {
                SampleService.getOne(callback, params.parentSample);
            }

        }, function(error, results) {
            if (error) {
                return res.serverError(error);
            }
            return res.json(results);
        });

    },

    /**
     *  @method
     *  @name create
     *  @description: POST /sample: create a new sample; transaction-safe implementation
     */
    create: function(req, res) {
        var sample = req.body;
        SampleService.simplify(sample); 

        DataType.findOne(sample.type)
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
    },
    
    /**
     * @method
     * @name update
     * @description PUT /sample/:ID - update an existing sample.
     *              Transaction-safe implementation
     */
    update: function(req, res) {
        var sample = req.body;
        SampleService.simplify(sample);

        transactionHandler.updateSample(sample)
        .then(function(idSample) {
            console.log(idSample);
            return Sample.findOne(idSample).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(err) {
            console.log(error.message);
            return res.serverError(error.message);
        });

    }

};

