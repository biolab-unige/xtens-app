(function(xtens) {
    
    /**
     * XTENS Router for Backbone
     */
    var XtensRouter = Backbone.Router.extend({

        routes: {
            "": "datatype",
            "datatypes": "datatype",
            "datatypes/new": "datatype-edit",
            "datatypes/edit/:id": "datatype-edit",
            "operators": "operator",
            "operators/new": "operator-edit",
            "operators/edit/:id": "operator-edit"
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
