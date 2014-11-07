/**
 *  @author Massimiliano Izzo
 */
var SampleService = {

    getOneAsync: function(next, id) {
        if (!id) {
            next(null, null);
        }
        else {
            Sample.findOne(_.parseInt(id)).populateAll().exec(next);
        }
    }

};
module.exports = SampleService;
