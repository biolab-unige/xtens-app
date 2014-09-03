(function(xtens) {
    
    /**
     * XTENS Router for Backbone
     */
    var XtensRouter = Backbone.Router.extend({

        routes: {
            "": "datatypes",
            "datatypes": "datatypes",
            "datatypes/new": "datatype-edit",
            "datatypes/edit/:id": "datatype-edit"
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
