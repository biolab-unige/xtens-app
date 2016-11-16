/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* globals _, sails, Data, DataType, DataService, DataTypeService, SubjectService, SampleService, QueryService, TokenService */
 "use strict";

 let JSONStream = require('JSONStream');
 let crudManager = sails.config.xtens.crudManager;
 const xtensConf = global.sails.config.xtens;
 const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;

 module.exports = {
    /*
    dataSearch: function(req, res) {

        let queryArgs = req.param('queryArgs');
        async.waterfall([
            function(callback) {
                DataService.advancedQuery(queryArgs, callback);
            },
            function(results, callback) {
                DataService.queryAndPopulateItemsById(results.rows, queryArgs.classTemplate, callback);
            }
        ], function(err, result) {
            if (err) {
                return res.serverError("error");
            }
            return res.json(result);
        });

    } */

    /**
     * @method
     * @name dataSearch
     * @return {Object} - an object containing an array of found Data matching the criteria, the DataType of the found Data and the DataTypePrivilegeLevel
     * @description perfor an advanced and nested query on the Data stored within the repository
     */
     dataSearch: function(req, res) {
         let queryArgs = _.isString(req.body.queryArgs) ? JSON.parse(req.body.queryArgs) : req.body.queryArgs;
         let isStream = _.isString(req.body.isStream) ? JSON.parse(req.body.isStream) : req.body.isStream;
         let queryObj, dataType, dataPrivilege, forbiddenFields, data;
         let idDataType = queryArgs.dataType;
         const operator = TokenService.getToken(req);
         let idOperator = operator.id;

         return DataService.preprocessQueryParamsAsync(queryArgs, idOperator, idDataType)

         .then(processedArgs => {
             sails.log(processedArgs);
             if (isStream) {
                 return DataService.executeAdvancedStreamQuery(processedArgs, operator, (err, stream) => {
               // initiate streaming into the sails:
                     stream.pipe(JSONStream.stringify(false)).pipe(res); //TODO
                 })
                 .then(data => {
                     sails.log("Total rows processed:", data.processed, "Duration in milliseconds:", data.duration);
                 })
                 .catch(error => {
                     sails.log("ERROR:", error.message || error);
                     throw new Error(error);
                 });

             }
             else {
                 return DataService.executeAdvancedQuery(processedArgs, operator, (err, results) => {
                     if(err){
                         return res.serverError(err.message);
                     }
                     res.json(results);
                 });
             }

         }).catch(error => {
             sails.log(error);
             res.serverError(error.message);
         });
     }

 };
