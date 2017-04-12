/**
 * @author Massimiliano Izzo
 * @description Backbone client-side module for storing Session details (using stateless API)
 */

(function(xtens, Session) {

    var i18n = xtens.module("i18n").en;
    var GroupPrivilegeLevels = xtens.module("xtensconstants").GroupPrivilegeLevels;
    var Project = xtens.module("project");
    var Group = xtens.module("group");

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
            this.set("isWheel", privilegeLevelArr.indexOf(GroupPrivilegeLevels.WHEEL) > -1);
            this.set("isAdmin", this.get("isWheel") || privilegeLevelArr.indexOf(GroupPrivilegeLevels.ADMIN) > -1);
            this.set("canAccessPersonalData", _.map(options.user.groups, 'canAccessPersonalData').indexOf(true) > -1);
            this.set("canAccessSensitiveData", _.map(options.user.groups, 'canAccessSensitiveData').indexOf(true) > -1);
            this.set("canAccessSensitiveData", _.map(options.user.groups, 'canAccessSensitiveData').indexOf(true) > -1);
            var that = this;
            var projects= new Project.List();
            projects.fetch({
                data: $.param({sort:'id ASC'}),
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
            'change #project-selector': 'setSessionProject'
        },
        el: '#menuBarNav',

        initialize : function(){
            _.bindAll(this);
            this.template = JST['views/templates/menu-bar.ejs'];
            this.render();
        },

        render: function() {
            this.$el.html(this.template({
                __:i18n,
                session: xtens.session
            }));

            $('#project-selector').selectpicker();
            if (xtens.session.get('activeProject')) {
                $('#project-selector').selectpicker('val', xtens.session.get('activeProject'));
            }
            $('#project-selector').selectpicker('refresh');

            return this;
        },

        setSessionProject: function (ev) {
            ev.preventDefault();
            xtens.session.set('activeProject', ev.target.value);

        }


    });



} (xtens, xtens.module("session")));
