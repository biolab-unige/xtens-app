/**
 *  Backbone module according to the pattern detailed here:
 *  http://bocoup.com/weblog/organizing-your-backbone-js-application-with-modules/ 
 */

var xtens = {
    // create this closure to contain the cached modules
    module: function() {
        // Internal module cache.
        var modules = {};

        /* Create a new module reference scaffold or load an
         * existing module */
        return function(name) {
            // If this module has already been created return it
            if (modules[name]) {
                return modules[name];
            }

            // Create a module and save it under this name
            return modules[name] = { Views: {} };
        };

    }(),

    app: _.extend({}, Backbone.Events)

};

// Using the jQuery ready event is excellent for ensuring all 
// // code has been downloaded and evaluated and is ready to be 
// // initialized. Treat this as your single entry point into the 
// // application
jQuery(function($) {
    // Initialise your application here (?)
    var Session = xtens.module("session");
    xtens.session = new Session.Model();

    Backbone.history.start();
});
