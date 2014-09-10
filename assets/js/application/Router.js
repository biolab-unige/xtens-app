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
           
        },

        loadView: function(view) {
            this.view && this.view.remove();
            this.view = view; 
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
