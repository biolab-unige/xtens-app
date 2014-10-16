/**
 * @author  Massimiliano Izzo
 * @description This is the main Backbone router
 */

(function(xtens) {

    var DataType = xtens.module("datatype");
    var Data = xtens.module("data");
    var Subject = xtens.module("subject");
    var Project = xtens.module("project");
    var MaterialType = xtens.module("materialtype");
    var Sample = xtens.module("sample");
<<<<<<< HEAD
    var Query = xtens.module("query");
=======
    var Operator = xtens.module("operator");
    var Group = xtens.module("group");
>>>>>>> b4ebe0e12aad28a028f4d6a94345ed1163676518

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
            "data/edit/:id": "dataEdit",
            "subjects": "subjectList",
            "subjects/new": "subjectEdit",
            "subjects/edit/:id": "subjectEdit",
            "samples": "sampleList",
            "samples/new": "sampleEdit",
            "samples/edit/:id": "sampleEdit",
<<<<<<< HEAD
            "query": "queryBuilder",
            "operators": "operator",
=======
            "operators": "operatorList",
>>>>>>> b4ebe0e12aad28a028f4d6a94345ed1163676518
            "operators/new": "operator-edit",
            "operators/edit/:id": "operator-edit",
            "groups":"groupList",
            "groups/new":"group-edit",
            "groups/edit/:id":"group-edit",
            "login":"login",
            "groups/operator/:id":"associationop",
            "groups/datatype/:id":"associationd"
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

        dataEdit: function(id) {
            var dataTypes = new DataType.List();
            var _this = this;
            dataTypes.fetch({
                success: function(dataTypes) {
                    var model = new Data.Model();
                    dataTypes = dataTypes.toJSON();
                    _this.loadView(new Data.Views.Edit({id: id, 
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

        groupList:function(){
        this.loadView(new Group.Views.List());
        },

        operatorList:function(){
        this.loadView(new Operator.Views.List());
        },


        subjectList: function() {
            this.loadView(new Subject.Views.List());
        },

        subjectEdit: function(id) {
            var dataTypes = new DataType.List();
            var projects = new Project.List();
            var _this = this;
            /*
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
            }); */
           $.when(dataTypes.fetch(), projects.fetch()).then(
                function(dataTypesRes, projectsRes) {
                    var SUBJECT = xtens.module("xtensconstants").DataTypeClasses.SUBJECT;
                    // get the last existing SUBJECT template (there should always be only one)
                    var subjectType = _.last(_.where(dataTypesRes[0], {classTemplate: SUBJECT}));
                    var model = new Subject.Model({type: subjectType});
                    _this.loadView(new Subject.Views.Edit({
                                                       id: id, 
                                                       projects: projectsRes[0],
                                                       model: model
                    }));
                }, function() {
                    alert("Error retrieving data from the server");
                } 
           );
        },

        sampleList: function() {
            this.loadView(new Sample.Views.List());
        },

        sampleEdit: function(id) {
            var dataTypes = new DataType.List();
            var subjects = new Subject.List();
            var _this = this;
            var SAMPLE = xtens.module("xtensconstants").DataTypeClasses.SAMPLE;

            $.when(dataTypes.fetch({ data: $.param({ classTemplate: SAMPLE }) }), subjects.fetch())
            .then(function(dataTypesRes, subjectsRes) {
                var model = new Sample.Model();
                _this.loadView(new Sample.Views.Edit({
                    id: id,
                    dataTypes: dataTypesRes[0],
                    subjects: subjectsRes[0],
                    model: model
                }));
            });
        },

        queryBuilder: function(id) {
            var dataTypes = new DataType.List();
            var that = this;
            dataTypes.fetch({
                success: function(dataTypes) {
                    that.loadView(new Query.Views.Builder({
                        id:id,
                        dataTypes: dataTypes.models,
                        model: new Query.Model()
                    }));    
                }
            });
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
