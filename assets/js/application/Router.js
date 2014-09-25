(function(xtens) {

    var DataType = xtens.module("datatype");
    var Data = xtens.module("data"); 
    /**
     * XTENS Router for Backbone
     */
    var XtensRouter = Backbone.Router.extend({

        routes: {
            "": "datatype",
            "datatypes": "dataTypeList",
            "datatypes/new": "dataTypeEdit",
            "datatypes/edit/:id": "dataTypeEdit",
            "data/new": "dataEdit",
            "data/:idDataType/:id": "dataEdit",
            "operators": "operator",
            "operators/new": "operator-edit",
            "operators/edit/:id": "operator-edit",
            "groups":"group",
            "groups/new":"group-edit",
            "groups/edit/:id":"group-edit",
            "login":"login"
        },

        loadView: function(view) {
            this.view && this.view.remove();
            this.view = view; 
        },

        dataTypeList: function() {
            this.loadView(new DataType.Views.List());
        },

        dataTypeEdit: function(id) {
            this.loadView(new DataType.Views.Edit({id: id}));
        },

        dataEdit: function(idDataType, id) {
            var dataTypes = new DataType.List();
            var _this = this;
            dataTypes.fetch({
                success: function(dataTypes) {
                    var model = new Data.Model();
                    dataTypes = dataTypes.toJSON();
                    _this.loadView(new Data.Views.Edit({idDataType: idDataType, 
                                                       id: id, 
                                                       dataTypes: dataTypes,
                                                       model: model
                    }));
                },

                error: function(err) {
                    console.log(err);
                    // TODO implement error handling here 
                }
            });
        },

    });

    xtens.router = new XtensRouter();


} (xtens));
