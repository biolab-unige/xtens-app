/**
 * OperatorController
 *
 * @description :: Server-side logic for managing operators
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

addGroupToOperator: function(req,res,next){

     /* Operator.findOne(req.param('operator_id')).populate('groups').exec(function(err,bean){
        if(err) return next(err);
        if(!bean) return next();
        bean.groups.add(req.param('group_id'));            
        bean.save(function(err) {
            if(err) return next(err);
            res.redirect('/operator');
        });
    });*/
}
   

/*removeGroupFromOperator: function(req,res,next){
   }
    /**
     * `OperatorController.create()`

create: function (req, res) {
res.view();  
},
*/

    /**
     * `OperatorController.destroy()`

destroy: function (req, res) {
return res.json({
todo: 'destroy() is not implemented yet!'
});
},


/**
 * `OperatorController.tag()`

tag: function (req, res) {
return res.json({
todo: 'tag() is not implemented yet!'
});
},


/**
 * `OperatorController.like()`

like: function (req, res) {
return res.json({
todo: 'like() is not implemented yet!'
});
}*/
};

