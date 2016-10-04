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
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;

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

    Group.Model = Backbone.Model.extend({
        urlRoot: '/group'
    });


    Group.List = Backbone.Collection.extend({
        url: '/group',
        model: Group.Model
    });


    /**
     * @class
     * @name Group.Views.Edit
     * @extends Backbone.Views
     */
    Group.Views.Edit = Backbone.View.extend({

        events: {
            'submit .edit-group-form': 'saveGroup',
            'click #delete': 'deleteGroup'
        },

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
            this.$modal = this.$(".group-modal");
            this.$form = this.$('form');
            this.$form.parsley(parsleyOpts);
            this.stickit();
            return this;
        },


        saveGroup: function(ev) {
            var that = this;
            this.model.save(null, {
                success: function(group) {
                    if (this.modal) {
                        this.modal.hide();
                    }
                    var modal = new ModalDialog({
                        title: i18n('ok'),
                        body: i18n('group-correctly-stored-on-server')
                    });
                    that.$modal.append(modal.render().el);
                    $('.modal-header').addClass('alert-success');
                    modal.show();

                    setTimeout(function(){ modal.hide(); }, 1200);
                    that.$('.group-modal').on('hidden.bs.modal', function (e) {
                        modal.remove();
                        xtens.router.navigate('groups', {trigger: true});
                    });
                },
                error: xtens.error
            });

            return false;
        },

        deleteGroup: function (ev) {
            ev.preventDefault();
            var that = this;
            if (this.modal) {
                this.modal.hide();
            }

            var modal = new ModalDialog({
                template: JST["views/templates/confirm-dialog-bootstrap.ejs"],
                title: i18n('confirm-deletion'),
                body: i18n('group-will-be-permanently-deleted-are-you-sure')
            });

            this.$modal.append(modal.render().el);
            modal.show();

            this.$('#confirm-delete').click( function (e) {
                modal.hide();
                var targetRoute = $(ev.currentTarget).data('targetRoute') || 'data';

                that.model.destroy({
                    success: function(model, res) {
                        modal.template= JST["views/templates/dialog-bootstrap.ejs"];
                        modal.title= i18n('ok');
                        modal.body= i18n('group-deleted');
                        that.$modal.append(modal.render().el);
                        $('.modal-header').addClass('alert-success');
                        modal.show();
                        setTimeout(function(){ modal.hide(); }, 1200);
                        that.$modal.on('hidden.bs.modal', function (e) {
                            modal.remove();
                            xtens.router.navigate('groups', {trigger: true});
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
            return this;
        }

    });

} (xtens, xtens.module("group")));
