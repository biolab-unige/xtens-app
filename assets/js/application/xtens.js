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

    var DataType = xtens.module("datatype");
    var Operator = xtens.module("operator");
    var Group = xtens.module("group");
    var AdminAssociation = xtens.module("adminassociation");
    var router = xtens.router;

    router.on('route:operator-association',function(id){
     router.loadView(new AdminAssociation.Views.GroupOperator({id:id}));
    });
  
    router.on('route:datatype-association',function(id){
     router.loadView(new AdminAssociation.Views.GroupDatatype({id:id}));
    });


    router.on('route:group',function() {
        router.loadView(new Group.Views.List());

    });

    router.on('route:group-edit',function(id){
        router.loadView(new Group.Views.Edit({id:id}));

    });

    router.on('route:operator',function() {
        router.loadView(new Operator.Views.List());

    });

    router.on('route:operator-edit',function(id){
        router.loadView(new Operator.Views.Edit({id:id}));
    });

    router.on('route:login',function(){
        router.loadView(new Operator.Views.Login());

    });
    
    Backbone.history.start();
});
