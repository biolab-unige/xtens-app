/**
 *  @author Massimiliano Izzo
 */
var DataService = {

    getOneAsync: function(next, id) {
        if (!id) {
            next(null, null);
        }
        else {
            Data.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    }

};
module.exports = DataService;
