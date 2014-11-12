/**
 *  @author Massimiliano Izzo
 */
var queryBuilder = sails.config.xtens.queryBuilder;

var DataService = {

    getOneAsync: function(next, id) {
        if (!id) {
            next(null, null);
        }
        else {
            Data.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    },

    advancedQueryAsync: function(next, queryArgs) {
        var query = queryBuilder.compose(queryArgs);
        Data.query(query.statement, query.parameters, next);
    },

    queryAndPopulateItemsById: function(next, foundRows, classTemplate) {
        var ids = _.pluck(foundRows, 'id');
        switch(classTemplate) {
            case "Subject":
                Subject.find({id: ids}).populateAll().exec(next);
                break;
            case "Sample":
                Sample.find({id: ids}).populateAll().exec(next);
                break;
            default:
                Data.find({id: ids}).populateAll().exec(next);
        }
    }

};
module.exports = DataService;
