/**
 * DataTypeController
 *
 * @description :: Server-side logic for managing datatypes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var DataTypeController = {
    /*
create: function(req, res) {
DataType.find()
.then(function(dataTypes) {
res.send(dataTypes);
}).fail(function(err) {
res.send(500, {error: "Database Error"});
});
},

find: function(req, res) {

},

findOne: function(req, res) {

},

update: function(req, res) {

},

updateSelective: function(req, res) {

},

destroy: function(req, res) {

} */

    buildHierarchy: function(req, res) {
        DataType.find({ parent: null}).populate('children').then(function(roots) {
            DataTypeService.getChildrenRecursive(roots);  
        })
        .then(function(results) {
            console.log(results);
            res.json(results);
        })
        .catch(function(error) {
            if (error) return res.serverError(error);
        });
        /*
        DataType.find({ parent: null }).exec(function(err, rootDataTypes) {
            if (err) {
                return res.serverError(err);
            }
            else {
                async.auto({
                        populate_recursive: function(next) {
                            async.each(rootDataTypes, DataTypeService.getChildrenRecursive, function(err) {
                                if (err) {
                                    return res.serverError(err);
                                }
                                next(null, rootDataTypes);
                            });
                        },
                        verify_results: ['populate_recursive', function(next, results) {
                            console.log(results.populate_recursive);
                            next(null, results.populate_recursive);
                        }]
                }, function(error, results) {
                    return res.json(results);
                });
            }
        }); */
        /*
        async.auto({
            get_roots: function(next) {
                DataType.find({ parent: null}).populate('children').exec(next);
            }  
        }); */
    }

};

module.exports = DataTypeController;
