(function(xtens) {

    var DataType = xtens.module("datatype");
    var Data = xtens.module("data");
    var Subject = xtens.module("subject");

    /**
     * XTENS Router for Backbone
     */
    var XtensRouter = Backbone.Router.extend({

        routes: {
            "": "datatype",
            "datatypes": "dataTypeList",
            "datatypes/new": "dataTypeEdit",
            "datatypes/edit/:id": "dataTypeEdit",
            "data": "dataList",
            "data/new": "dataEdit",
            "data/edit/:idDataType/:id": "dataEdit",
            "subject/new": "subjectEdit",
            "subject/edit/:idDataType/:id": "subjectEdit",
            "operators": "operator",
            "operators/new": "operator-edit",
            "operators/edit/:id": "operator-edit",
            "groups":"group",
            "groups/new":"group-edit",
            "groups/edit/:id":"group-edit",
            "login":"login",
            "groups/operator/:id":"operator-association",
            "groups/datatype/:id":"datatype-association"
        },

        loadView: function(view) {
            this.view && this.view.remove();
            this.view = view; 
        },

        dataTypeList: function() {
            this.loadView(new DataType.Views.List());
        },

        dataTypeEdit: function(id) {
            var _this = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({
                success: function(dataTypes) {
                    var model = new DataType.Model();
                    _this.loadView(new DataType.Views.Edit({id: id, dataTypes: dataTypes.toJSON(), model: model}));
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },

        dataList: function() {
            this.loadView(new Data.Views.List());
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

        subjectEdit: function(idDataType, id) {
            var dataTypes = new DataType.List();
            var _this = this;
            dataTypes.fetch({
                success: function(dataTypes) {
                    var model = new Subject.Model();
                    var SUBJECT = xtens.module("xtensconstants").DataTypeClasses.SUBJECT;
                    dataTypes = _.where(dataTypes.toJSON(), {classTemplate: SUBJECT});
                    _this.loadView(new Subject.Views.Edit({idDataType: idDataType, 
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
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
