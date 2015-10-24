/**
 * @module Group
 * @author Valentina Tedone
 * @author Massimiliano Izzo
 */

(function(xtens, Group) {

    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    var GroupPrivilegeLevels = xtens.module("xtensconstants").GroupPrivilegeLevels;
    var Datatype = xtens.module("datatype");
    var Operator = xtens.module("operator");


    Group.Model = Backbone.Model.extend({
        urlRoot: '/group',
    });


    Group.List = Backbone.Collection.extend({
        url: '/group',
        model: Group.Model,
    });


    /**
     * @class
     * @name Group.Views.Edit
     * @extends Backbone.Views
     */
    Group.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'group',

        initialize: function(options) {
            // _.bindAll(this,'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/group-edit.ejs"]; 
            this.render();
        },

        bindings: {
            '#name': 'name',

            '#privilege-level': { 
                observe: 'privilegeLevel',
                selectOptions: {
                    collection: function() {
                        var coll = [];
                        _.each(GroupPrivilegeLevels, function(value) {
                            coll.push({
                                label: value.toUpperCase(),
                                value: value
                            });
                        });
                        return coll;
                    }
                }
            },

            "#can-access-personal-data": {
                observe: "canAccessPersonalData",
                getVal: function($el) {
                    return $el.prop('checked');
                }

            },

            "#can-access-sensitive-data": {
                observe: "canAccessSensitiveData",
                getVal: function($el) {
                    return $el.prop("checked");
                }
            }


        },

        render: function()  {
            this.$el.html(this.template({__:i18n, group: this.model}));
            this.stickit();
            return this;
        },

        events: {
            'click #save': 'saveGroup',
            'click #delete': 'deleteGroup'
        },
        
        saveGroup: function(ev) {
            this.model.save({
                success: function(group) {
                    console.log("Group.Views.Edit.saveGroup - group correctly inserted/updated!");
                    // router.navigate('groups', {trigger: true});
                },
                error: xtens.error,    
            });

            router.navigate('groups', {trigger: true});
            return false;
        },
        
        deleteGroup: function (ev) {
            this.group.destroy({
                success: function () {
                    console.log('Group.Views.Edit - group destroyed');
                    router.navigate('groups', {trigger:true});
                },
                error: xtens.error
            });
            return false;
        }
    });

    Group.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'group',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/group-list.ejs"];
            this.render();
        },

        render: function(options) {

            var _this = this;
            var groups= new Group.List();
            groups.fetch({
                success: function(groups) {
                    _this.$el.html(_this.template({__: i18n, groups: groups.models}));
                    return _this;
                },
                error: 	xtens.error
            });
        }

    });

} (xtens, xtens.module("group")));
