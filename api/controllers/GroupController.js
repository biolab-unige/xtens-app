var GroupController ={

    addOperator: function(req,res) {
        var id_group = req.param('id_group');
        var id_operator = req.param('id_operator');
        Group.findOne(id_group).populate('members').exec(function(e,r) {
            r.members.add(id_operator);
            r.save(function(err){console.log(err);});

        });
    },

    removeOperator:function(req,res){
        var id_group = req.param('id_group');
        var id_operator = req.param('id_operator');
        Group.findOne(id_group).populate('members').exec(function(e,r) {
            r.members.remove(id_operator);
            r.save(function(err){console.log(err);});

        });

    }


};

module.exports = GroupController;
