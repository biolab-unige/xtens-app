/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
        var data = null;
        DataService.advancedQueryAsync(queryArgs)
        .then(function(results) {
            return DataService.queryAndPopulateItemsByIdAsync(results.rows, queryArgs.classTemplate);
        })
        .then(function(foundData) {
            data = foundData;
            if (_.isEmpty(foundData)) {
                return DataType.findOne(foundData[0].type);
            }
            else return;
        })
        .then(function(dataType) {
            res.json({data: data, dataType: dataType });
        })
        .catch(function(error) {
            res.serverError(error.message);
        });
    } 
	
};
