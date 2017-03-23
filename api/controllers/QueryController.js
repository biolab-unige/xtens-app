/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* globals _, sails,  DataService, TokenService */
 "use strict";

 let JSONStream = require('JSONStream');

 module.exports = {

    /**
     * @method
     * @name dataSearch
     * @return {Object} - an object containing an array of found Data matching the criteria, the DataType of the found Data and the DataTypePrivilegeLevel
     * @description perfor an advanced and nested query on the Data stored within the repository
     */
     dataSearch: function(req, res) {
         let { body : { queryArgs, isStream }} = req;
         const operator = TokenService.getToken(req);
         queryArgs = _.isString(queryArgs) ? JSON.parse(queryArgs) : queryArgs;
         isStream = _.isString(isStream) ? JSON.parse(isStream) : isStream;
         const idDataType = queryArgs.dataType;

         return DataService.preprocessQueryParamsAsync(queryArgs, operator.groups, idDataType)

         .then(processedArgs => {
             sails.log(processedArgs);
             if (isStream) {
                 return DataService.executeAdvancedStreamQuery(processedArgs, operator, (err, stream) => {
                     // initiate streaming into the sails:
                     stream.pipe(JSONStream.stringify(false)).pipe(res);
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
