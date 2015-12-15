/**
 * SampleController
 *
 * @description :: Server-side logic for managing samples
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint node: true */
/* jshint esnext: true */
/* globals _, sails, Subject, Sample, Data, DataType, SubjectService, BiobankService, SampleService, TokenService, QueryService, DataService */
"use strict";

var BluebirdPromise = require('bluebird');
var ControllerOut = require("xtens-utils").ControllerOut;
var crudManager = sails.config.xtens.crudManager;
var SAMPLE = sails.config.xtens.constants.DataTypeClasses.SAMPLE;
let ValidationError = require('xtens-utils').Errors.ValidationError;

module.exports = {
    
    /** 
     *  POST /sample
     *  @method
     *  @name create
     *  @description: create a new sample; transaction-safe implementation
     */
    create: function(req, res) {
        var co = new ControllerOut(res);
        var sample = req.allParams();
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
                throw new ValidationError(validationRes.error);
            }
        })
        /*
        .then(function(idSample) {
            console.log(idSample);
            return Sample.findOne(idSample).populate('files');
        }) */
        .then(function(result) {
            console.log(result);
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(201, result);
        })
        .catch(function(error) {
            console.log(error.message);
            return co.error(error);
        });
    },

    /**
     * GET /sample/:id
     * @method
     * @name findOne
     * @description - retrieve an existing subject
     */
    findOne: function(req, res) {
        var co = new ControllerOut(res);
        var id = req.param('id');
        var query = Sample.findOne(id);
        
        query = QueryService.populateRequest(query, req);
        
        query.then(function(result) {
            return res.json(result);
        })

        .catch(function(error) {
            return co.error(error);
        });

    },

    /**
     * GET /sample
     * GET /sample/find
     *
     * @method
     * @name find
     * @description Find samples based on criteria provided in the request
     */
    find: function(req, res) {
        var co = new ControllerOut(res);

        var query = Sample.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));

        query = QueryService.populateRequest(query, req);

        query.then(function(sample) {
            res.json(sample);
        })
        .catch(function(err) {
            return co.error(err);
        });
    },
    
    /** 
     * PUT /sample/:ID
     * @method
     * @name update
     * @description - update an existing sample.
     *              Transaction-safe implementation
     */
    update: function(req, res) {
        let co = new ControllerOut(res);
        var sample = req.allParams();
        SampleService.simplify(sample);

        DataType.findOne(sample.type).then(function(dataType) {
            var validationRes = SampleService.validate(sample, true, dataType);
            if (validationRes.error === null) {
                sample = validationRes.value;
                return crudManager.updateSample(sample, dataType.name);
            }
            else {
                throw new ValidationError(validationRes.error);
            }
        }) 
        /*
        .then(function(idSample) {
            console.log(idSample);
            return Sample.findOne(idSample).populate('files');
        }) */
        .then(function(result) {
            console.log(result);
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
            return co.error(error);
        });

    },

    /**
     * DELETE /sample/:id
     * @method
     * @name destroy
     * @description 
     */
    destroy: function(req, res) {
        var co = new ControllerOut(res);
        var id = req.param('id');
        var idOperator = TokenService.getToken(req).id;

        if (!id) {
            return co.badRequest({message: 'Missing sample ID on DELETE request'});
        }

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
            return res.json({
                deleted: deleted
            });
        })

        .catch(function(err) {
            return co.error(err);
        });

    },

     /**
     * @method
     * @name edit
     * @description retrieve all required models for editing/creating a Sample via client web-form
     */
    edit: function(req, res) {
        var co = new ControllerOut(res);
        var params = req.allParams();
        var idOperator = TokenService.getToken(req).id;
        
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

    }

};

