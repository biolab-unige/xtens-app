/**
 * DataTypeController
 *
 * @description :: Server-side logic for managing datatypes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var ControllerOut = require("xtens-utils").ControllerOut;
var crudManager = sails.config.xtens.crudManager;

var DataTypeController = {

    /**
     * GET /dataType
     * GET /dataType/find
     *
     * @method
     * @name find
     * @description Find dataTypes based on criteria
     */
    find: function(req, res) {
        var co = new ControllerOut(res);

        var query = DataType.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));
        // .populate('parents');  // commented out by Massi 2015-05-20

        if (!req.param('populate')) {
            query.populate('parents');  // by default populate only with 'parents' dataTypes
        }
        else {
            query = QueryService.populateRequest(query, req);
        }

        query.then(function(dataTypes) {
            res.json(dataTypes);
        })
        .catch(function(err) {
            return co.error(err);
        });
    },

    /**
     * POST /dataType
     * @method
     * @name create
     */
    create: function(req, res) {
        var co = new ControllerOut(res);
        var dataType = req.allParams(); 

        if (!dataType.name) dataType.name = dataType.schema && dataType.schema.name;
        if (!dataType.model) dataType.model = dataType.schema && dataType.schema.model;

        // omit all the properties relative to associations
        // var newDataType = _.omit(req.body, ['parents', 'children', 'datas', 'groups']);
        // var parents = req.param('parents');

        // Validate data type (schema included)
        var validationRes = DataTypeService.validate(dataType, true);

        if (validationRes.error) {
            return co.error(validationRes.error);
        }
        else {
            crudManager.createDataType(dataType).then(function(idDataType) {
                return DataType.findOne(idDataType).populate('parents');
            })
            .then(function(dataType) {
                res.set('Location', req.baseUrl + req.url + '/'  + result.id);
                return res.json(201, dataType);
            })
            .catch(function(error) {
                return co.error(error);
            });
        }
    },

    /**
     * PUT /dataType/:id
     * @method
     * @name update
     */
    update: function(req, res) {
        var co = new ControllerOut(res);
        var dataType = req.allParams();

        // Validate data type (schema included)
        var validationRes = DataTypeService.validate(dataType, true);

        if (validationRes.error) {
            return co.error(validationRes.error);
        }
        else {
            crudManager.updateDataType(dataType).then(function(idDataType) {
                return DataType.findOne(idDataType).populate('parents');
            })
            .then(function(dataType) {
                return res.json(dataType);
            })
            .catch(function(error) {
                return co.error(error);
            });
        }
    },

    /**
     * @method
     * @name destroy
     * @description DELETE /dataType/:id
     */
    destroy: function(req, res) {
        var co = new ControllerOut(res);
        var id = req.param('id');
        
        if (!id) {
            return co.badRequest({message: 'Missing dataType ID on DELETE request'});
        }

        return crudManager.deleteDataType(id)

        .then(function(deleted) {
            return res.json({
                deleted: deleted
            });
        })

        .catch(function(err) {
            return co.error(err);
        });

    }, 

    /**
     * @deprecated
     */
    buildHierarchy: function(req, res) {
        var co = new ControllerOut(res);
        DataType.find({ parent: null}).populate('children').then(function(roots) {
            DataTypeService.getChildrenRecursive(roots);  
        })
        .then(function(results) {
            console.log(results);
            res.json(results);
        })
        .catch(function(error) {
            if (error) return co.error(error);
        });
    },

    /**
     * @method
     * @name buildGraph
     * @description generate and visualize the datatype graph given a root datatype.
     */

    buildGraph : function(req,res) {

        var name = req.param("idDataType");
        var fetchDataTypeTree = sails.config.xtens.databaseManager.recursiveQueries.fetchDataTypeTree;
        console.log(req.param("idDataType"));
        
        return DataType.findOne({name:name})
        
        .then(function(result) {
            var id = result.id;
            var template = result.model;
            // This query returns the parent-child associations among the datatypes
            
            function dataTypeTreeCb (err, resp) {

                var links = [];

                // if there aren't children do not print any link
                if(resp.rows.length === 0) {
                    links.push({
                        'source': name,
                        'depth': 0,
                        'target': null,
                        'source_template': template,
                        'target_template': null
                    });
                }
                // populate the links array
                for(var i =0;i<resp.rows.length;i++) {            
                    links.push({
                        'source':resp.rows[i].parentname,
                        'target':resp.rows[i].childname,
                        'depth':resp.rows[i].depth,
                        'source_template':resp.rows[i].parenttemplate,
                        'target_template':resp.rows[i].childtemplate 
                    });  
                }

                var json = {'links':links};
                console.log(json);
                return res.json(json);
            }
            
            fetchDataTypeTree(id, dataTypeTreeCb);
        });

    }


};

module.exports = DataTypeController;
