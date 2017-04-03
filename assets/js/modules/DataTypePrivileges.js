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
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;
    var router = xtens.router;

    var parsleyOpts = {
        priorityEnabled: false,
        // excluded: "select[name='fieldUnit']",
        successClass: "has-success",
        errorClass: "has-error",
        classHandler: function(el) {
            return el.$element.parent();
        },
        errorsWrapper: "<span class='help-block'></span>",
        errorTemplate: "<span></span>"
    };

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

        events: {
            'submit .edit-datatypeprivileges-form': 'privilegesOnSave',
            'click .delete': 'privilegesOnDelete'
        },

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
            this.$modal = this.$(".privilege-modal");
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
                    }
                });
            }
            this.$form = this.$('form');
            this.$form.parsley(parsleyOpts);
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

        privilegesOnSave: function(ev) {
            var groupId = this.group.id;
            var that = this;
            this.model.save(null, {
                success: function(dataTypePrivileges) {
                    if (that.modal) {
                        that.modal.hide();
                    }
                    var modal = new ModalDialog({
                        title: i18n('ok'),
                        body: i18n('privilege-correctly-stored-on-server')
                    });
                    that.$modal.append(modal.render().el);
                    $('.modal-header').addClass('alert-success');
                    modal.show();

                    setTimeout(function(){ modal.hide(); }, 1200);
                    that.$('.privilege-modal').on('hidden.bs.modal', function (e) {
                        modal.remove();
                        router.navigate('datatypeprivileges/' + groupId, {trigger: true});
                    });
                },
                error: function(model, res) {
                    xtens.error(res);
                }
            });
            return false;
        },

        privilegesOnDelete: function(ev) {
            ev.preventDefault();
            var groupId = this.group.id;
            var that = this;
            if (this.modal) {
                this.modal.hide();
            }

            var modal = new ModalDialog({
                template: JST["views/templates/confirm-dialog-bootstrap.ejs"],
                title: i18n('confirm-deletion'),
                body: i18n('privilege-will-be-permanently-deleted-are-you-sure')
            });

            this.$modal.append(modal.render().el);
            modal.show();

            this.$('#confirm-delete').click( function (e) {
                modal.hide();

                that.model.destroy({
                    success: function(model, res) {
                        that.$modal.one('hidden.bs.modal', function (e) {
                            modal.template= JST["views/templates/dialog-bootstrap.ejs"];
                            modal.title= i18n('ok');
                            modal.body= i18n('privilege-deleted');
                            that.$modal.append(modal.render().el);
                            $('.modal-header').addClass('alert-success');
                            modal.show();
                            setTimeout(function(){ modal.hide(); }, 1200);
                            that.$modal.on('hidden.bs.modal', function (e) {
                                modal.remove();
                                router.navigate('datatypeprivileges/' + groupId, {trigger: true});
                            });
                        });                      
                    },
                    error: function(model, res) {
                        xtens.error(res);
                    }
                });
                return false;
            });
        }

    });

    /**
     * @class
     * @name DataTypePrivileges.View.List
     * @extends Backbone.View
     */
    DataTypePrivileges.Views.List = Backbone.View.extend({
        events: {
            'change #projectSelector':'filterDataTypes'
        },
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
            this.mapTypeProjects = options.mapTypeProjects;
            this.projects = options.projects;
            var mapTypeProjects = {};
            _.forEach(this.privileges.models,function (priv) {
                var dt = _.find(options.dataTypes,function (dt) {
                    return dt.id === priv.get('dataType');
                });
                dt ? mapTypeProjects[dt.id] = dt.project.name : null;
            });
            this.mapTypeProjects = mapTypeProjects;
            this.render();
        },

        render: function() {
            this.$el.html(this.template({
                __: i18n,
                group: this.group,
                privileges: this.privileges,
                projects : _.uniq(_.values(this.mapTypeProjects)),
                dataTypes : this.dataTypes,
                mapTypeProjects: this.mapTypeProjects
            }));
            $('.selectpicker').selectpicker();

            return this;
        },

        filterDataTypes: function(){

            var rex = new RegExp($('#projectSelector').val());

            if(rex =="/all/"){this.clearFilter();}else{
                $('.content').hide();
                $('.content').filter(function() {
                    return rex.test($(this).text());
                }).show();
            }
        },

        clearFilter: function(){
            $('.projectSelector').val('');
            $('.content').show();
        }
    });


} (xtens, xtens.module("datatypeprivileges")));
