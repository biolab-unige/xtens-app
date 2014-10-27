/**
 *  @author Massimiliano Izzo
 */

var QueryService = {


    dataSearch: function(queryParams) {
        var queryBuilder = sails.config.xtens.queryBuilder;
        var query = queryBuilder.compose(queryParams);
        console.log(query.statement);
        console.log(query.parameters);
        Data.query(query.statement, query.parameters, function(err, result) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(result.rows);
            }
        });
    }
    


};

module.exports = QueryService;
