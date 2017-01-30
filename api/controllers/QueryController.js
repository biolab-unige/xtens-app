/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* globals _, sails, Data, DataType, DataService, DataTypeService, SubjectService, SampleService, QueryService, TokenService */
 "use strict";

 let JSONStream = require('JSONStream');
 let crudManager = sails.hooks['persistence'].getDatabaseManager().crudManager;
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
         let { body : { queryArgs, isStream }} = req;
         const operator = TokenService.getToken(req), idOperator = operator.id;
         queryArgs = _.isString(queryArgs) ? JSON.parse(queryArgs) : queryArgs;
         isStream = _.isString(isStream) ? JSON.parse(isStream) : isStream;
         const idDataType = queryArgs.dataType;

         return DataService.preprocessQueryParamsAsync(queryArgs, idOperator, idDataType)

         .then(processedArgs => {
             sails.log(processedArgs);
             if (isStream) {
                 return DataService.executeAdvancedStreamQuery(processedArgs, operator, (err, stream) => {
                     // initiate streaming into the sails:
                     stream.pipe(JSONStream.stringify(false)).pipe(res); //TODO
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

         })

         .catch(error => {
             sails.log.error(error);
             res.serverError(error.message);
         });
     }

 };
