/**
 * @author Massimiliano Izzo
 * @description Backbone client-side module for storing Session details (using stateless API)
 */

(function(xtens, Session) {

    var GroupPrivilegeLevels = xtens.module("xtensconstants").GroupPrivilegeLevels;

    Session.Model = Backbone.Model.extend({
        
        defaults: {
            login: null,
            accessToken: null
        },

        events: {
            '#logout click': 'reset'
        },

        initialize: function(options) {
            this.load(options);
        },

        load: function(options) {
            options = options || {};
            if (!options.user) {
                return;
            }

            this.set("login", options.user && options.user.login);
            this.set("accessToken", options.token);
            
            if (_.isEmpty(options.user.groups)) {
                return;
            }
            var privilegeLevelArr = _.pluck(options.user.groups, 'privilegeLevel');
            this.set("isWheel", privilegeLevelArr.indexOf(GroupPrivilegeLevels.WHEEL) > -1);
            this.set("isManager", this.get("isWheel") || privilegeLevelArr.indexOf(GroupPrivilegeLevels.MANAGER) > -1);
            this.set("canAccessPersonalData", _.pluck(options.user.groups, 'canAccessPersonalData').indexOf(true) > -1);
            this.set("canAccessSensitiveData", _.pluck(options.user.groups, 'canAccessSensitiveData').indexOf(true) > -1);

        },

        reset: function() {
            this.clear().set(this.defaults);
        },

        isAuthenticated: function() {
            return Boolean(this.get("accessToken"));
        }

    });

} (xtens, xtens.module("session")));
