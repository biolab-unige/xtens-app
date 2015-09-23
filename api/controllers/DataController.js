/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var ControllerOut = require("xtens-utils").ControllerOut;
var transactionHandler = sails.config.xtens.transactionHandler;
var DATA = sails.config.xtens.constants.DataTypeClasses.DATA;

module.exports = {

    /**
     * @description retrieve all required information to create an EditData form
     */

    edit: function(req, res) {
        var co = new ControllerOut(res);
        var params = req.allParams();
        params.model = DATA;
        var idOperator = TokenService.getToken(req);

        async.parallel({

            data: function(callback) {
                DataService.getOne(params.id, callback);
            },

            dataTypes: function(callback) {
                // DataTypeService.get(callback, params);
                DataTypeService.getByOperator(idOperator, params, callback);
            },

            parentSubject: function(callback) {
                SubjectService.getOne(params.parentSubject, callback);
            },

            parentSample: function(callback) {
                SampleService.getOne(params.parentSample, callback);
            },

            parentData: function(callback) {
                DataService.getOne(params.parentData, callback);
            }

        }, function(err, results) {
            if (err) {
                return co.error(err);
            }
            return res.json(results);

        });

    },

    /** 
     *  @method
     *  @name create
     *  @description POST /data -> create a new Data Instance; transaction-safe implementation 
     *                   
     */
    create: function(req, res) {
        var data = req.body;
        var co = new ControllerOut(res);

        DataService.simplify(data);

        DataType.findOne(data.type).then(function(dataType) {
            var validationRes = DataService.validate(data, true, dataType);
            if (validationRes.error === null) {
                data = validationRes.value;
                var dataTypeName = dataType && dataType.name;
                return transactionHandler.createData(data, dataTypeName);
            }
            else {
                throw new Error(validationRes.error);
            } 
        })
        .then(function(idData) {
            console.log(idData);
            return Data.findOne(idData).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log("Error: " + error.message);
            return co.error(error);
        });
    },

    /** 
     *  @method
     *  @name update
     *  @description PUT /data/id -> update an existing Data Instance; transaction-safe implementation
     *
     */
    update: function(req, res) {
        var data = req.body;
        var co = new ControllerOut(res);

        DataService.simplify(data);

        DataType.findOne(data.type).then(function(dataType) {
            var validationRes = DataService.validate(data, true, dataType);
            if (validationRes.error === null) {
                data = validationRes.value;
                return transactionHandler.updateData(data);
            }
            else {
                throw new Error(validationRes.error);
            } 
        })
        .then(function(idData) {
            return Data.findOne(idData).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log("Error: " + error.message);
            return co.error(error);
        });
    } 
};

