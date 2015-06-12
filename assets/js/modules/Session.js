/**
 * @author Massimiliano Izzo
 * @description Backbone client-side module for storing Session details (using stateless API)
 */

(function(xtens, Session) {

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
            this.set("login", options.user && options.user.login);
            this.set("accessToken", options.token);
        },

        reset: function() {
            this.clear().set(this.defaults);
        },

        isAuthenticated: function() {
            return Boolean(this.get("accessToken"));
        }

    });

} (xtens, xtens.module("session")));
