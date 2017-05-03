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
        },

        getHigherPrivileges: function(groups) {
            let levels = {};
            if (!groups || _.isEmpty(groups)) {return [];}
            if ( groups.length === 1 ) { return groups;}

            var groupedPriv = _.mapValues(_.groupBy(groups, 'id'));
            _.forEach(groupedPriv, function (list,key) {
                levels[key] = {};
                _.forEach(list, function (el) {
                    if(!levels[key].privilegeLevel || el.privilegeLevel === EDIT){
                        levels[key] = el;
                        if( levels[key].privilegeLevel === EDIT){ return false; }
                    }
                    else if (levels[key].privilegeLevel === VIEW_OVERVIEW && (el.privilegeLevel === VIEW_DETAILS || el.privilegeLevel === DOWNLOAD)) {
                        levels[key] = el;
                    }
                    else if (levels[key].privilegeLevel === VIEW_DETAILS && el.privilegeLevel === DOWNLOAD) { levels[key] = el; }
                });
            });
            let results = _.values(levels);
            return results;
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

            $('#project-selector').on('change.bs.select', function () {
                location.reload();
            });

            return this;
        },

        setSessionProject: function (ev) {
            ev.preventDefault();

            xtens.session.set('activeProject', ev.target.value);

        }


    });



} (xtens, xtens.module("session")));
