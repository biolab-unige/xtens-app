/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    
    dataSearch: function(req, res) {
        var queryArgs = req.param('queryArgs');
        async.waterfall([
            function(callback) {
                DataService.advancedQuery(callback, queryArgs);
            },
            function(results, callback) {
                DataService.queryAndPopulateItemsById(callback, results.rows, queryArgs.classTemplate); 
            }
        ], function(err, result) {
            if (err) {
                return res.serverError("error");
            }
            return res.json(result); 
        });
        /*
        Data.query(query.statement, query.parameters, function(err, results) {
            if (err) {
                res.badRequest('Invalid parameters submitted.');
            }
            else {
                res.json(results.rows);
            }
        });
       */

    } 
	
};
