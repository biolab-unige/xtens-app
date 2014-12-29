/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;

module.exports = {

    /**
     * @description retrieve all required information to create an EditData form
     */

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
                SubjectService.getOne(callback, params.parentSubject);
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

    },

    /**
     *  @description POST /data -> create a new Data Instance; implementation based on 
     *               Bluebird Promises + Knex (transaction support) using xtens-transact
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
    
};

