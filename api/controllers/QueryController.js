/**
 * QueryController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing queries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    
    dataSearch: function(req, res) {
        var queryBuilder = sails.config.xtens.queryBuilder;
        var queryArgs = req.param('queryArgs');
        var query = queryBuilder.compose(queryArgs);
        Data.query(query.statement, query.parameters, function(err, results) {
            if (err) {
                res.badRequest('Invalid parameters submitted.');
            }
            else {
                res.json(results.rows);
            }
        });

    } 
	
};
