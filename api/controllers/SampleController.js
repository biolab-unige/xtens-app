/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var BluebirdPromise = require('bluebird');
var ControllerOut = require("xtens-utils").ControllerOut;
var crudManager = sails.config.xtens.crudManager;
var SAMPLE = sails.config.xtens.constants.DataTypeClasses.SAMPLE;

module.exports = {
    
    /**
     * @method
     * @name edit
     * @description retrieve all required models for editing/creating a Sample via client web-form
     */
    edit: function(req, res) {
        var co = new ControllerOut(res);
        var params = req.allParams();
        var idOperator = TokenService.getToken(req);
        
        return BluebirdPromise.props({
            sample: SampleService.getOneAsync(params.id),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: idOperator,
                model: SAMPLE,
                idDataTypes: params.idDataTypes 
            }),
            biobanks: BiobankService.getAsync(params),
            donor: SubjectService.getOneAsync(params.donor),
            parentSample: SampleService.getOneAsync(params.parentSample)
        }) 
        
        .then(function(results) {
            return res.json(results);
        })

        .catch(function(err) {
            return co.error(err);
        });

    },

    /**
     *  @method
     *  @name create
     *  @description: POST /sample: create a new sample; transaction-safe implementation
     */
    create: function(req, res) {
        var co = new ControllerOut(res);
        var sample = req.body;
        SampleService.simplify(sample); 

        DataType.findOne(sample.type)
        .then(function(sampleType) {
            var validationRes = SampleService.validate(sample, true, sampleType);
            if (validationRes.error === null) {
                sample = validationRes.value;
                var sampleTypeName = sampleType && sampleType.name;
                return crudManager.createSample(sample, sampleTypeName);
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
            return co.error(error);
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
                return crudManager.updateSample(sample);
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
            return co.error(error);
        });

    },

    /**
     * @method
     * @name destroy
     * @description DELETE /subject/:id
     */
    destroy: function(req, res) {
        var co = new ControllerOut(res);
        var id = req.param('id');
        var idOperator = TokenService.getToken(req);

        return BluebirdPromise.props({
            sample: Sample.findOne({id: id}),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: idOperator,
                model: SAMPLE
            })
        })
        .then(function(result) {
            var allowedDataTypes = _.pluck(result.dataTypes, 'id');
            if (allowedDataTypes.indexOf(result.sample.type) > -1) {
                return crudManager.deleteSample(id);
            }
        })

        .then(function(deleted) {
            if (deleted === undefined) {
                return co.forbidden({message: 'User nor authorized to delete Sample with ID: ' + id});
            }
            return res.json(deleted);
        })

        .catch(function(err) {
            return co.error(err);
        });

    }

};

