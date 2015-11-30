/**
 * @module
 * @name DataTypePrivileges
 * @author Massimiliano Izzo
 * @description handles the models (i.e. entities) that associate user groups to dataTypes
 *              (many-to-many through association)
 */
(function(xtens, DataTypePrivileges) {

    // dependencies
    var i18n = xtens.module("i18n").en;    
    var DataTypePrivilegeLevels = xtens.module("xtensconstants").DataTypePrivilegeLevels;
    var router = xtens.router;


    /**
     * @class
     * @name DataTypePrivileges.Model
     * @extends Backbone.Model
     */
    DataTypePrivileges.Model = Backbone.Model.extend({

        urlRoot: '/dataTypePrivileges'

    });

    /**
     * @class
     * @name DataTypePrivileges.List
     * @extends Backbone.Collection
     */
    DataTypePrivileges.List = Backbone.Collection.extend({

        url: '/dataTypePrivileges',
        model: DataTypePrivileges.Model

    });

    /**
     * @class
     * @name DataTypePrivileges.View.Edit
     * @extends Backbone.View
     */
    DataTypePrivileges.Views.Edit = Backbone.View.extend({

        tagName: 'div',

        className: 'dataTypePrivilege', 

        // TODO: fix this!!
        initialize: function(options) {
            $("#main").html(this.el);
            this.dataTypes = options.dataTypes;
            this.dataType = options.dataType;
            this.group = options.group;
            this.model = new DataTypePrivileges.Model(_.assign({
                group: this.group.id,
                privilegeLevel: DataTypePrivilegeLevels.VIEW_OVERVIEW
            }, options.dataTypePrivileges));
            this.template = JST["views/templates/datatypeprivileges-edit.ejs"];
            this.render();
        },

        render: function() {
            this.$el.html(this.template({
                __:i18n, 
                privilege: this.model,
                group: this.group, 
                dataType: this.dataType || {},
                privilegeLevels: _.values(DataTypePrivilegeLevels)
            }));
            this.stickit();
            if (!this.model.id) {
                this.addBinding(null, '#data-type', {
                    observe: "dataType",
                    initialize: function($el) {
                        $el.select2({placeholder: i18n("please-select") });
                    },
                    selectOptions: {
                        collection: 'this.dataTypes',
                        labelPath: 'name',
                        valuePath: 'id',
                        defaultOption: {
                            label: "",
                            value: null
                        }
                    },
                });
            }
            return this;
        },

        bindings: {

            "#privilege-level": {
                observe: "privilegeLevel",
                initialize: function($el) {
                    $el.select2();
                },
                selectOptions: {
                    collection: function() {
                        var coll = [];
                        _.each(DataTypePrivilegeLevels, function(value) {
                            coll.push({
                                label: value.toUpperCase(),
                                value: value
                            });
                        });
                        return coll;
                    }
                }
            }

        },

        events: {
            'click #save-privilege': 'privilegesOnSave',
            'click .delete': 'privilegesOnDelete'
        },

        privilegesOnSave: function(ev) {
            var groupId = this.group.id;
            this.model.save(null, {
                success: function(dataTypePrivileges) {
                    router.navigate('datatypeprivileges/' + groupId, {trigger: true});
                },
                error: xtens.error
            });
            return false;
        },

        privilegesOnDelete: function(ev) {
            var groupId = this.group.id;
            this.model.destroy({
                success: function(dataTypePrivileges) {
                    router.navigate('datatypeprivileges/' + groupId, {trigger: true});
                },
                error: xtens.error
            });
            return false;
        }

    });

    /**
     * @class
     * @name DataTypePrivileges.View.List
     * @extends Backbone.View
     */
    DataTypePrivileges.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'dataTypePrivileges', 

        /**
         * @param{Object} options, contains: 
         *                      - group{Group.Model}
         *                      - dataTypes{DataType.List}
         */
        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/datatypeprivileges-list.ejs"];
            this.group = options.group;
            this.privileges = options.privileges;
            this.render();
        },

        render: function() {
            this.$el.html(this.template({
                __: i18n, 
                group: this.group,
                privileges: this.privileges
            }));
            return this;
        }    
    });


} (xtens, xtens.module("datatypeprivileges")));
