var GroupController ={

    addOperator: function(id_group,id_operator) {
        Group.find({id:id_group}).populate('operators').exec(function(e,r) {
            r[0].operators.add(id_operator);
            r[0].save();

        });
    },

    removeOperator:function(id_group,id_operator){

    }


};

module.exports = GroupController;
