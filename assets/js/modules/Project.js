(function(xtens, Project) {

    var i18n = xtens.module("i18n").en;
    // var router = xtens.router;
    // var Datatype = xtens.module("datatype");
    // var Operator = xtens.module("operator");
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

    Project.Model = Backbone.Model.extend({
        urlRoot: '/project'
    });

    Project.List = Backbone.Collection.extend({
        url: '/project',
        model: Project.Model
    });

    Project.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'project',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/project-list.ejs"];
            this.render();
        },

        render: function() {

            var _this = this;
            var projects= new Project.List();
            projects.fetch({
                data: $.param({sort:'id ASC'}),
                success: function(projects) {
                    _this.$el.html(_this.template({__: i18n, projects: projects.models}));
                    return _this;
                },
                error: xtens.error
            });
            return this;
        }

    });

    Project.Views.Edit = Backbone.View.extend({

        events: {
            'submit .edit-project-form': 'saveProject',
            'click #delete': 'deleteProject'
        },

        tagName: 'div',
        className: 'project',

        initialize: function(options) {

            if (options.project) {
                this.model = new Project.Model(options.project);
            }
            else {
                this.model = new Project.Model();
            }
            // this.noAssDt = options.dataTypes;
            this.assDt = this.model.get('dataTypes');
            this.noAssGr = options.groups;
            this.assGr = this.model.get('groups');

            $("#main").html(this.el);
            this.template = JST["views/templates/project-edit.ejs"];
            this.render();
        },

        bindings: {
            '#name': 'name',

            '#description': 'description'


        },



        render: function()  {
            var that = this;
            this.$el.html(this.template({__:i18n, project: this.model, assDt: this.assDt, noAssGr: this.noAssGr, assGr: this.assGr}));
            this.$modal = this.$(".project-modal");
            this.$form = this.$('form');
            this.$form.parsley(parsleyOpts);
            // this.dataTypesToBeSaved = _.map(this.assDt, 'id');
            this.groupsToBeSaved = _.map(this.assGr, 'id');

            // var noDT = document.getElementById('noassociatedDataTypes');
            // Sortable.create(noDT, {
            //     group: 'dataType',
            //     animation: 300
            // });
            // var assDT = document.getElementById('associatedDataTypes');
            // Sortable.create(assDT, {
            //     group: 'dataType',
            //     animation: 300,
            //     disabled:true
            //
            //     // Element is dropped into the list from another list
            //     onAdd: function (/**Event*/evt) {
            //         var itemEl = evt.item;  // dragged HTMLElement
            //         evt.from;  // previous list
            //         // + indexes from onEnd
            //         that.dataTypesToBeSaved.push(itemEl.value);
            //     },
            //     // Element is removed from the list into another list
            //     onRemove: function (/**Event*/evt) {
            //       // same properties as onUpdate
            //         var itemEl = evt.item;
            //         var index = _.indexOf(that.dataTypesToBeSaved, itemEl.value);
            //         that.dataTypesToBeSaved.splice(index,1);
            //     }
            // });
            var noGr = document.getElementById('noassociatedGroups');
            Sortable.create(noGr, {
                group: 'groups',
                animation: 300
            });
            var assGr = document.getElementById('associatedGroups');
            Sortable.create(assGr, {
                group: 'groups',
                animation: 300,

                // Element is dropped into the list from another list
                onAdd: function (/**Event*/evt) {
                    var itemEl = evt.item;  // dragged HTMLElement
                    evt.from;  // previous list
                    // + indexes from onEnd
                    that.groupsToBeSaved.push(itemEl.value);
                },
                // Element is removed from the list into another list
                onRemove: function (/**Event*/evt) {
                  // same properties as onUpdate
                    var itemEl = evt.item;
                    var index = _.indexOf(that.groupsToBeSaved, itemEl.value);
                    that.groupsToBeSaved.splice(index,1);
                }
            });
            this.stickit();
            return this;
        },


        saveProject: function(ev) {
            var that = this;
            this.model.set('groups',this.groupsToBeSaved);
            this.model.unset('dataTypes');
            this.model.save(null, {
                success: function(project) {
                    if (this.modal) {
                        this.modal.hide();
                    }
                    var modal = new ModalDialog({
                        title: i18n('ok'),
                        body: i18n('project-correctly-stored-on-server')
                    });
                    that.$modal.append(modal.render().el);
                    $('.modal-header').addClass('alert-success');
                    modal.show();

                    setTimeout(function(){ modal.hide(); }, 1200);
                    that.$('.project-modal').on('hidden.bs.modal', function (e) {
                        modal.remove();
                        xtens.router.navigate('projects', {trigger: true});
                    });
                },
                error: xtens.error
            });

            return false;
        },

        deleteProject: function (ev) {
            ev.preventDefault();
            var that = this;
            if (this.modal) {
                this.modal.hide();
            }

            var modal = new ModalDialog({
                template: JST["views/templates/confirm-dialog-bootstrap.ejs"],
                title: i18n('confirm-deletion'),
                body: i18n('project-will-be-permanently-deleted-are-you-sure'),
                type: "delete"
            });

            this.$modal.append(modal.render().el);
            modal.show();

            this.$('#confirm-delete').click( function (e) {
                modal.hide();
                $('.modal-backdrop').remove();
                var targetRoute = $(ev.currentTarget).data('targetRoute') || 'data';

                that.model.destroy({
                    success: function(model, res) {
                        that.$modal.one('hidden.bs.modal', function (e) {
                            modal.template= JST["views/templates/dialog-bootstrap.ejs"];
                            modal.title= i18n('ok');
                            modal.body= i18n('project-deleted');
                            that.$modal.append(modal.render().el);
                            $('.modal-header').addClass('alert-success');
                            modal.show();
                            setTimeout(function(){ modal.hide(); }, 1200);
                            that.$modal.on('hidden.bs.modal', function (e) {
                                modal.remove();
                                xtens.router.navigate('projects', {trigger: true});
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


} (xtens, xtens.module("project")));
