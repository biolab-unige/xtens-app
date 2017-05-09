/**
 * @author Massimiliano Izzo
 * @description Backbone client-side module for storing Session details (using stateless API)
 */

(function(xtens, Session) {

    var i18n = xtens.module("i18n").en;
    var GroupPrivilegeLevels = xtens.module("xtensconstants").GroupPrivilegeLevels;
    var Project = xtens.module("project");
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;

    /**
     * @class
     * @name Session.Model
     * @extends Backbone.Model
     */
    Session.Model = Backbone.Model.extend({

        defaults: {
            login: null,
            accessToken: null,
            projects: []
        },

        events: {
            '#logout click': 'reset'
        },

        initialize: function(options) {
            this.load(options);
        },

        load: function(options, callback) {
            options = options || {};
            if (!options.user) {
                return;
            }

            this.set("login", options.user && options.user.login);
            this.set("accessToken", options.token);

            if (_.isEmpty(options.user.groups)) {
                return;
            }
            var privilegeLevelArr = _.map(options.user.groups, 'privilegeLevel');

            var mapPrivProject = {"admin":[],"standard":[]};
            // TODO: creare variabile di sessione con gruppi - settare variabile di sessione con currentLevelByProject in base al progetto selezionato
            _.forEach(options.user.groups, function (group) {
                if (group.privilegeLevel === "wheel") {
                    mapPrivProject["admin"].push(_.map(group.projects,'id'));
                }else {

                    mapPrivProject[group.privilegeLevel].push(_.map(group.projects,'id'));
                }
            });
            // this.set("standardProjects", _.uniq(_.flatten(mapPrivProject.standard)));
            this.set("adminProjects", _.uniq(_.flatten(mapPrivProject.admin)));
            this.set("isWheel", privilegeLevelArr.indexOf(GroupPrivilegeLevels.WHEEL) > -1);
            this.set("isAdmin", this.get("isWheel") || privilegeLevelArr.indexOf(GroupPrivilegeLevels.ADMIN) > -1);
            this.set("canAccessPersonalData", _.map(options.user.groups, 'canAccessPersonalData').indexOf(true) > -1);
            this.set("canAccessSensitiveData", _.map(options.user.groups, 'canAccessSensitiveData').indexOf(true) > -1);
            // this.set("canAccessSensitiveData", _.map(options.user.groups, 'canAccessSensitiveData').indexOf(true) > -1);
            var that = this;
            var projects= new Project.List();
            projects.fetch({
                data: $.param({sort:'id ASC',populate:'groups'}),
                success: function(results) {

                    that.set("projects", results.toJSON());
                    return callback();
                },
                error: xtens.error
            });

        },

        reset: function() {
            this.clear().set(this.defaults);
        },

        isAuthenticated: function() {
            return Boolean(this.get("accessToken"));
        }

    });

    /**
     * @class
     * @name Session.Views.MenuBar
     * @extends Backbone.Views
     * @description session-related menu bar
     */
    Session.Views.MenuBar = Backbone.View.extend({
        events:{
            'change #project-selector': 'setSessionProject',
            'click #btn-project': 'selectionProjectModal'
        },

        el: '#menuBarNav',

        initialize : function(){
            _.bindAll(this);
            this.template = JST['views/templates/menu-bar.ejs'];
            this.render();
        },

        render: function() {


            if (xtens.session.get('activeProject') !== 'all') {
                var adminProjects = xtens.session.get("adminProjects");
                var idProject = _.find(xtens.session.get('projects'),function (p) { return p.name === xtens.session.get('activeProject'); }).id;
                var isAdminProject = _.find(adminProjects, function(pr){ return pr === idProject;});
                xtens.session.set("isAdmin", isAdminProject ? true : false);
            }

            var projects = xtens.session.get("projects");

            this.$el.html(this.template({
                __:i18n,
                session: xtens.session,
                projectLength: projects.length
            }));

            if (projects.length > 1) {
                $('#btn-project').tooltip();
            }

            return this;
        },

        setSessionProject: function (ev) {
            ev.preventDefault();

            xtens.session.set('activeProject', ev.target.value);
            location.reload();

        },

        selectionProjectModal: function (ev) {
            ev.stopPropagation();

            var projects = xtens.session.get("projects");
            if (projects.length > 1) {
                var modal = new ModalDialog({
                    title: i18n('project-selection'),
                    template: JST["views/templates/project-modal.ejs"],
                    data: { __: i18n, projects: projects}
                });
                $('#project-selector').selectpicker('hide');

                $('#main').append(modal.render().el);
                modal.show();

                $("#checkbox").change(function() {
                    if(this.checked) {
                        $('#project-selector').selectpicker('show');
                        $('#project-selector').on('change.bs.select', function (e) {
                            $('#confirm-project').prop('disabled', false);
                            $('#confirm-project').addClass('btn-success');
                            $('#confirm-project').on('click.bs.button', function (e) {
                                e.preventDefault();
                                var projectSelected = $('#project-selector').val();
                                modal.hide();
                                $('.xtens-modal').on('hidden.bs.modal', function (e) {

                                    modal.remove();
                                    $(this).data('bs.modal', null);

                                    xtens.session.set('activeProject', projectSelected);
                                    location.reload();
                                });
                            });
                        });


                    }
                    else {
                        $('#project-selector').selectpicker('hide');
                    }
                });
            }
        }


    });



} (xtens, xtens.module("session")));
