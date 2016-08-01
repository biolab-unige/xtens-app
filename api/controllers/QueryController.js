/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* globals _, sails, Data, DataType, DataService, DataTypeService, SubjectService, SampleService, QueryService, TokenService */

 const xtensConf = global.sails.config.xtens;
 const VIEW_OVERVIEW = xtensConf.constants.DataTypePrivilegeLevels.VIEW_OVERVIEW;

 module.exports = {
    /*
    dataSearch: function(req, res) {

        var queryArgs = req.param('queryArgs');
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
     * @return {Object} - an object containing an array of found Data matching the criteria, and the DataType of the found Data
     * @description perfor an advanced and nested query on the Data stored within the repository
     */
     dataSearch: function(req, res) {
         var queryArgs = req.param('queryArgs');
         var data, dataType;
         var idDataType = queryArgs.dataType;
         const operator = TokenService.getToken(req);

         DataService.executeAdvancedQueryAsync(queryArgs)

        .then(results => {

            data = results.rows;
            return DataType.findOne(idDataType);
        })
        .then(result => {
            dataType = result;
            return DataTypeService.getDataTypePrivilegeLevel(operator.id, dataType.id);
        })
        .then(dataTypePrivilege => {
            if (_.isEmpty(data)) { return; }
            //if operator has not privilege on dataType return empty data
            //else if operator has not at least Details privilege level delete metadata object
            if (!dataTypePrivilege || _.isEmpty(dataTypePrivilege) ){ return {}; }
            else if( dataTypePrivilege.privilegeLevel === VIEW_OVERVIEW) {
                for (var datum of data) { datum['metadata'] = {}; }
                return data;
            }
                //populate type attributes of data and filter Out Sensitive Info
            for (datum of data) { datum['type'] = dataType.id; }
            return DataService.filterOutSensitiveInfo(data, operator.canAccessSensitiveData);
        })
        .then(results => {

            if(results && !_.isArray(results)){
                data[0] = results;
            }
            else if (results){
                data = results;
            }
            res.json({data: data, dataType: dataType });

        })
        .catch(error => {
            res.serverError(error.message);
        });
     }

 };
