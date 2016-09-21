/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* globals _, sails, Data, DataType, DataService, DataTypeService, SubjectService, SampleService, QueryService, TokenService */
 "use strict";

 let pg = require('pg');
 let pgp = require('pg-promise')();
 let QueryStream = require('pg-query-stream');
 let JSONStream = require('JSONStream');
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
         let queryArgs = JSON.parse(req.body.queryArgs);
         let queryObj, dataType, dataPrivilege, forbiddenFields;
         let idDataType = queryArgs.dataType;
         const operator = TokenService.getToken(req);
         let idOperator = operator.id;
         let db = pgp('postgres://xtenspg:xtenspg@localhost:5432/xtensigg');

         DataService.preprocessQueryParams(queryArgs,idOperator,idDataType)

         .then(processedArgs => {
             let data = [], first = true, dataSent;
             dataType = processedArgs.dataType;
             dataPrivilege = processedArgs.dataTypePrivilege;
             queryObj = processedArgs.queryObj;
             forbiddenFields = processedArgs.forbiddenFields;

             let query = new QueryStream(queryObj.statement,queryObj.parameters);

             db.stream(query, function (stream) {

                 stream.once('data',function () {
                     stream.pause();
                     stream.push({dataPrivilege:dataPrivilege});
                     stream.push({dataType:dataType});
                     stream.resume();
                 });

                 stream.on('end', () => {
                     console.log('Stream ended');
                     stream.close();
                 });

                 stream.on('data',function (chunk) {

                     if(chunk.dataType || chunk.dataPrivilege){ return; }

                     if (!dataPrivilege || _.isEmpty(dataPrivilege) ) { return; }

                     else if( dataPrivilege.privilegeLevel === VIEW_OVERVIEW) { chunk.metadata = {}; }

                   else if( forbiddenFields.length > 0 && operator.canAccessSensitiveData){
                       _.each(forbiddenFields, (forbField) => {
                           if(chunk.metadata[forbField.formattedName]){
                              //  console.log("Deleted field: " + chunk.metadata[forbField.formattedName]);
                               delete chunk.metadata[forbField.formattedName];
                           }
                       });
                   }

                 });
      // initiate streaming into the console:
                 stream.pipe(JSONStream.stringify("","@#","")).pipe(res);
             })
           .then(function (data) {
               console.log("Total rows processed:", data.processed, "Duration in milliseconds:", data.duration);
           })
           .catch(function (error) {
               console.log("ERROR:", error.message || error);
           });

         });
     }

 };
