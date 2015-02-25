/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;
var DATA = sails.config.xtens.constants.DataTypeClasses.DATA;

module.exports = {

    /**
     * @description retrieve all required information to create an EditData form
     */

    edit: function(req, res) {

        var params = req.allParams();
        params.model = DATA;
        var idOperator = req.session.operator && req.session.operator.id;

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
                return res.serverError("error");
            }
            return res.json(results);

        });

    },

    /**
     *  @description POST /data -> create a new Data Instance; transaction-safe implementation 
     *                   
     */

    create: function(req, res) {
        var data = req.body;
        DataType.findOne(data.type)
        .then(function(dataType) {
            var dataTypeName = dataType && dataType.name;
            return transactionHandler.createData(data, dataTypeName);
        })
        .then(function(idData) {
            console.log(idData);
            return Data.findOne(idData).populateAll();
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
     *  @description PUT /data/id -> update an existing Data Instance; transaction-safe implementation
     *
     */
    update: function(req, res) {
        var data = req.body;

        ["type", "parentSubject", "parentSample", "parentData"].forEach(function(elem) {
            if (data[elem]) {
                data[elem] = data[elem].id || data[elem];
            }
        });

        transactionHandler.updateData(data)
        .then(function(idData) {
            return Data.findOne(idData).populateAll();
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

