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
            'click .delete': 'privilegesOnDelete',
            'change select#data-type': 'setGroupByDataTypeProject'
        },

        initialize: function(options) {
            $("#main").html(this.el);
            this.dataTypes = options.dataTypes;
            this.dataType =  options.params.dataTypeId;
            this.group = options.params.groupId;
            this.groups = options.groups;
            if (options.dataTypePrivilege) {
                // var that =this;
                this.model = new DataTypePrivileges.Model(options.dataTypePrivilege);
                this.dataTypes.push(options.dataTypePrivilege.dataType);
            }
            else {
                this.model = new DataTypePrivileges.Model({
                    dataType: this.dataType ? _.parseInt(this.dataType) : null,
                    group: this.group ? _.parseInt(this.group) : null,
                    privilegeLevel: DataTypePrivilegeLevels.VIEW_OVERVIEW});
            }
            this.template = JST["views/templates/datatypeprivileges-edit.ejs"];
            this.render();
        },

        render: function() {
            this.$el.html(this.template({
                __:i18n,
                privilege: this.model
                // group: this.group,
                // dataType: this.dataType || {},
                // privilegeLevels: _.values(DataTypePrivilegeLevels)
            }));
            this.$modal = this.$(".privilege-modal");
            this.stickit();
            if (this.dataType) {
                this.setGroupByDataTypeProject();
            }
            $('#group').val() ? $('#group').prop('disabled',true) : null;
            $('#data-type').val() ? $('#data-type').prop('disabled',true) : null;
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
            },
            '#group': {
                observe: 'group',
                initialize: function($el) {
                    $el.select2({placeholder: i18n("please-select") });
                },
                selectOptions: {
                    collection: 'this.groups',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: "",
                        value: null
                    }
                },
                getVal: function($el) {
                    return $el.val() && _.parseInt($el.val());
                },
                onGet: function(val) {
                    return  val && _.isObject(val) ? val.id : val;
                }
            },
            '#data-type': {
                observe: 'dataType',
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
                getVal: function($el) {
                    return $el.val() && _.parseInt($el.val());
                },
                onGet: function(val) {
                    return  val && _.isObject(val) ? val.id : val;
                }
            }

        },

        setGroupByDataTypeProject: function (ev) {
            var selDatatype = ev ? _.parseInt(ev.target.value) : _.parseInt($('#data-type').val());
            var dt = _.findWhere(this.dataTypes, {id:selDatatype});
            var filteredValues  = [], newColl = [];

            this.groups.forEach(function (gr) {
                if( _.findWhere(gr.projects, {id: dt.project})){
                    return newColl.push({label:gr.name,value:gr.id});
                }
            });
            newColl.forEach(function (gr) {
                _.find($('#group').val(),function (val) {
                    if(gr.value === _.parseInt(val)){
                        filteredValues.push(val);
                    }
                });
            });
            var options = {selectOptions:{collection: newColl}};
            Backbone.Stickit.getConfiguration($('#group')).update($('#group'),filteredValues,{},options);
            $('#group').val(filteredValues).trigger("change");
        },

        privilegesOnSave: function(ev) {
            ev.preventDefault();

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
                        if (xtens.session.get("isWheel")) {
                            router.navigate('datatypeprivileges?groupId=' + dataTypePrivileges.get("group"), {trigger: true});
                        }else {
                            router.navigate('datatypes', {trigger: true});
                        }
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
            var groupId = this.model.get("group");
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
                                router.navigate('datatypeprivileges?groupId=' + groupId, {trigger: true});
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
            'change #projectSelector':'filterDataTypes',
            'click #newPrivilege': 'openNewPrivilegeView'
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
            this.dataTypes = options.dataTypes;
            this.privileges = options.privileges;
            this.params = options.params;
            var mapTypeProjects = {};
            _.forEach(this.privileges.models,function (priv) {
                var dt = _.find(options.dataTypes.models,function (dt) {
                    return dt.id === priv.get('dataType').id;
                });
                dt ? mapTypeProjects[dt.id] = dt.get("project").name : null;
            });
            this.mapTypeProjects = mapTypeProjects;
            this.render();
        },

        render: function() {
            this.$el.html(this.template({
                __: i18n,
                params: this.params,
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
        },

        openNewPrivilegeView: function(ev) {
            ev.preventDefault();
            var dataTypeQuery = this.params.dataTypeId ? 'dataTypeId=' + this.params.dataTypeId : '';
            var groupQuery = this.params.groupId ? 'groupId=' + this.params.groupId : '';
            var privilegeLevelQuery = this.privilegeLevel ? 'privilegeLevel=' + this.privilegeLevel : '';
            var queryString = _.compact([dataTypeQuery, groupQuery,
                                        privilegeLevelQuery]).join('&');
            var route = _.trim(['/datatypeprivileges/new', queryString].join('/0?'), '/0?');
            xtens.router.navigate(route, {trigger: true});
            return false;
        }
    });


} (xtens, xtens.module("datatypeprivileges")));
