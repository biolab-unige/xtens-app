/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;
var SAMPLE = sails.config.xtens.constants.DataTypeClasses.SAMPLE;

module.exports = {
    
    /**
     * @method
     * @name edit
     * @description retrieve all required models for editing/creating a Sample via client web-form
     */
    edit: function(req, res) {

        var params = req.allParams();
        params.model = SAMPLE;
        var idOperator = TokenService.getToken(req);

        async.parallel({

            sample: function(callback) {
                SampleService.getOne(params.id, callback);   
            },

            dataTypes: function(callback) {
                // DataTypeService.get(callback, params);
                DataTypeService.getByOperator(idOperator, params, callback);
            },

            biobanks: function(callback) {
                BiobankService.get(params, callback);
            },

            donor: function(callback) {
                SubjectService.getOne(params.donor, callback);
            },

            parentSample: function(callback) {
                SampleService.getOne(params.parentSample, callback);
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
            var validationRes = SampleService.validate(sample, true, sampleType);
            if (validationRes.error === null) {
                sample = validationRes.value;
                var sampleTypeName = sampleType && sampleType.name;
                return transactionHandler.createSample(sample, sampleTypeName);
            }
            else {
                throw new Error(validationRes.error);
            }
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

        DataType.findOne(sample.type).then(function(dataType) {
            var validationRes = SampleService.validate(sample, true, dataType);
            if (validationRes.error === null) {
                sample = validationRes.value;
                return transactionHandler.updateSample(sample);
            }
            else {
                throw new Error(validationRes.error);
            }
        })
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

