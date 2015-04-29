/**
 * DataTypeController
 *
 * @description :: Server-side logic for managing datatypes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;

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

        console.log("DataType.find - prova");

        var query = DataType.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req)).populate('parents');

        query.then(function(dataTypes) {
            res.json(dataTypes);
        })
        .catch(function(err) {
            return res.serverError(err);
        });
    },

    /**
     * POST /dataType
     * @method
     * @name create
     */
    create: function(req, res) {
        console.log("DataType.create - prova");

        var dataType = req.body;
        if(!dataType.schema) {
            return res.badRequest("a DataType requires at least valid JSON schema");
        }
        if (!dataType.name) dataType.name = dataType.schema.name;
        if (!dataType.model) dataType.model = dataType.schema.model;
        // omit all the properties relative to associations
        // var newDataType = _.omit(req.body, ['parents', 'children', 'datas', 'groups']);
        // var parents = req.param('parents');

        transactionHandler.createDataType(dataType).then(function(idDataType) {
            return DataType.findOne(idDataType).populate('parents');
        })
        .then(function(dataType) {
            return res.json(dataType);
        })
        .catch(function(error) {
            return res.serverError(error.message);
        });

        /*
           DataType.create(newDataType)

        // if the dataType is successfully created, create all the 
        .then(function(dataType) {
        newDataType = dataType;
        return BluebirdPromise.map(parents, function(parent) {
        console.log('Associating new DataType ', dataType.name ,'with Parent ', parent);
        dataType.parents.add(parent);
        return dataType.save();
        });
        })

        .then(function() {
        return DataType.find(newDataType.id).populate('parents');
        })

        .then(function(dataType) {
        return res.json(dataType);
        })

        .catch(function(error) {
        return res.serverError(error);
        }); */

    },

    /**
     * PUT /dataType/:id
     * @method
     * @name update
     */
    update: function(req, res) {
        var dataType = req.body;

        transactionHandler.updateDataType(dataType).then(function(idDataType) {
            return DataType.findOne(idDataType).populate('parents');
        })
        .then(function(dataType) {
            return res.json(dataType);
        })
        .catch(function(error) {
            return res.serverError(error.message);
        });
    },

    /**
     * @deprecated
     */

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
    },

    /**
     * @method
     * @name buildGraph
     * @description generate and visualize the datatype graph given a root datatype.
     */

    buildGraph : function(req,res) {

        console.log(req.param("idDataType"));
        var name = req.param("idDataType");
        return DataType.findOne({name:name}).then(function(result) {
            var id = result.id;
            var template = result.model;
            // This query returns the parent-child associations among the datatypes
            DataType.query('WITH RECURSIVE nodes(parentId, parentName,parentTemplate,childId, childName,childTemplate, path, depth) AS (select r.datatype_children,p1.name,p1.model,r.datatype_parents,p2.name,p2.model,ARRAy[r.datatype_parents],1 from datatype_children__datatype_parents as r, data_type as p1,data_type as p2 where r.datatype_children = $1 and p1.id = r.datatype_children and p2.id = r.datatype_parents union all select r.datatype_children,p1.name,p1.model,r.datatype_parents,p2.name,p2.model,path || r.datatype_children, nd.depth + 1 from datatype_children__datatype_parents as r,data_type as p1,data_type as p2,nodes as nd where r.datatype_children = nd.childId and p1.id = r.datatype_children and p2.id = r.datatype_parents ) select * from nodes;',[id], function(err,resp) {

                var links = [];

                // if there aren't children do not print any link
                if(resp.rows.length === 0) {
                    links.push({
                        'source':name,'depth':0 ,'target':null,'source_template':template,'target_template':null
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
            });  
        });      
    }


};

module.exports = DataTypeController;
