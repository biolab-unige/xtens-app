/**
 * GroupController
 *
 * @description :: Server-side logic for managing user groups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint esnext: true */
/* jshint node: true */


var ControllerOut = require("xtens-utils").ControllerOut;

var GroupController = {

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
    },

    /**
     * @method
     * @name addDatatype
     */
    addDatatype: function(req, res) {
        console.log(req.params());

        var co = new ControllerOut(res);
        var group = req.param('id_group');
        var dataType = req.param('id_datatype');

        global.sails.models.datatypeprivileges.create({
            group: group,
            dataType: dataType,
            privilegeLevel: global.sails.config.xtens.privilegeLevel.EDIT
        })

        .then(function(result) {
            return res.ok();
        })

        .catch(function(err) {
            return co.error(err);
        });

        /*
        Group.findOne(id_group).populate('dataTypes').exec(function(e,r) {
            r.dataTypes.add(id_datatype);
            r.save(function(err){console.log(err);});
        }); */
    },

    /**
     * @method
     * @name removeDatatype
     */
    removeDatatype: function(req, res) {

        var co = new ControllerOut(res);
        var group = req.param('id_group');
        var datatype = req.param('id_datatype');

        global.sails.models.datatypeprivileges.destroy({
            group: group,
            dataType: datatype
        })

        .then(function(result) {
            return res.ok();
        })

        .catch(function(err) {
            return co.error(err);
        });

        /*
        Group.findOne(id_group).populate('dataTypes').exec(function(e,r) {
            r.dataTypes.remove(id_datatype);
            r.save(function(err){console.log(err);});
        }); */
    }


};

module.exports = GroupController;
