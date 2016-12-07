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

    app: _.extend({}, Backbone.Events),

    infoBrowser: (function() {
        var ua= navigator.userAgent, tem,
            M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
            if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M= M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M;
    })()

};

// Using the jQuery ready event is excellent for ensuring all
// // code has been downloaded and evaluated and is ready to be
// // initialized. Treat this as your single entry point into the
// // application
jQuery(function($) {
    // create Session object
    var Session = xtens.module("session"), userSession;
    xtens.session = new Session.Model();

    // retrieve user session info from sessionStorage on page reload (if available)
    if (window.sessionStorage.getItem('xtensUserSession')) {
        try {
            userSession = JSON.parse(window.sessionStorage.getItem('xtensUserSession'));
        }
        catch(err) {
            console.log(err);
        }
    }

    // remove the access token from sessionStorage (to avoid XSS risks)
    window.sessionStorage.removeItem("userSession");

    // set session model with retrieved data
    xtens.session.set(userSession);

    // if the page is refreshed store the user session object (login, accessToken, ...) on the sessionStorage
    window.addEventListener("beforeunload", function(event) {
        console.log("window.onBeforeunload fired!");
        window.sessionStorage.setItem('xtensUserSession', JSON.stringify(xtens.session));
        console.log(window.sessionStorage.getItem('xtensUserSession'));
    });

    // start backbone history
    Backbone.history.start();

});
