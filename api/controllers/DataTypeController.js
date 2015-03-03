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
},

        buildGraph : function(req,res) {
            
            console.log(req.param("idDataType"));
            var name = req.param("idDataType");
           return DataType.findOne({name:name}).then(function(result){
            var id = result.id;
            var template = result.classTemplate;
           DataType.query('WITH RECURSIVE nodes(parentId, parentName,parentTemplate,childId, childName,childTemplate, path, depth) AS (select r.datatype_parents,p1.name,p1.class_template,r.datatype_children,p2.name,p2.class_template,ARRAy[r.datatype_parents],1 from datatype_children__datatype_parents as r, data_type as p1,data_type as p2 where r.datatype_parents = '+ id+' and p1.id = r.datatype_parents and p2.id = r.datatype_children union all select r.datatype_parents,p1.name,p1.class_template,r.datatype_children,p2.name,p2.class_template,path || r.datatype_parents, nd.depth + 1 from datatype_children__datatype_parents as r,data_type as p1,data_type as p2,nodes as nd where r.datatype_parents = nd.childId and p1.id = r.datatype_parents and p2.id = r.datatype_children ) select * from nodes;',function(err,resp){
                //var nodes = [];
                var links = [];
                if(resp.rows.length === 0){
                links.push({'source':name,'depth':0 ,'target':null,'source_template':template,'target_template':null});
                }
            for(var i =0;i<resp.rows.length;i++){
            // nodes.push({'id':resp.rows[i].parentid,'name':resp.rows[i].parentname,'template':resp.rows[i].parenttemplate});
            // nodes.push({'id':resp.rows[i].childid, 'name':resp.rows[i].childname,'template':resp.rows[i].childtemplate});
             links.push({'source':resp.rows[i].parentname,'target':resp.rows[i].childname,'depth':resp.rows[i].depth,'source_template':resp.rows[i].parenttemplate,'target_template':resp.rows[i].childtemplate });  
            }
           // nodes = _.uniq(nodes,'name');
            //var json = {'nodes':nodes,'links':links};
            var json = {'links':links};
            console.log(json);
            return res.json(json);
            });  
        });      
        }

        };

        module.exports = DataTypeController;
