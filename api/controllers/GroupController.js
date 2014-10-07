var GroupController ={

    addOperator: function(req,res) {
        var id_group = req.param('id_group');
        var id_operator = req.param('id_operator');
        Group.findOne(id_group).populate('members').exec(function(e,r) {
            r.members.add(id_operator);
            r.save(console.log);

        });
    },

    removeOperator:function(id_group,id_operator){
        Group.findOne(id_group).populate('operators').exec(function(e,r) {
            r.operators.remove(id_operator);
            r.save();

        });

    }


};

module.exports = GroupController;
