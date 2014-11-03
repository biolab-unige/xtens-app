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
    var Query = xtens.module("query");
    var Operator = xtens.module("operator");
    var Group = xtens.module("group");
    var AdminAssociation = xtens.module("adminassociation");


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
            "query": "queryBuilder",
            "operators": "operatorList",
            "operators/new": "operatorEdit",
            "operators/edit/:id": "operatorEdit",
            "groups":"groupList",
            "groups/new":"groupEdit",
            "groups/edit/:id":"groupEdit",
            "login":"loginView",
            "groups/operator/:id":"associationOperator",
            "groups/datatype/:id":"associationDataType"
        },

        loadView: function(view) {
            this.view && this.view.remove();
            this.view = view; 
        },

        associationDataType:function(id){
            var _this = this;
            var dominant = new Group.Model({id:id});
            var nondominant = new DataType.List();
            $.when(nondominant.fetch(),dominant.fetch()).then(function(nondominantRes,dominantRes){
                _this.loadView(new AdminAssociation.Views.Edit({
                    dominant:new Group.Model(dominantRes[0]),
                    nondominant: nondominantRes[0],
                    nondominantName:'dataTypes',
                    field:'name'
                }));
            });
        },

        associationOperator: function(id){
            var _this = this;
            var dominant = new Group.Model({id:id});
            var nondominant = new Operator.List();
            $.when(nondominant.fetch(),dominant.fetch()).then(function(nondominantRes,dominantRes){
                _this.loadView(new AdminAssociation.Views.Edit({
                    dominant:new Group.Model(dominantRes[0]),
                    nondominant: nondominantRes[0],
                    nondominantName:'members',
                    field:'login'
                }));
            });
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

        groupEdit:function(id){
            this.loadView(new Group.Views.Edit({id:id}));
        },

        loginView:function(){
            this.loadView(new Operator.Views.Login());
        },

        operatorList:function(){
            this.loadView(new Operator.Views.List());
        },

        operatorEdit:function(id){
            this.loadView(new Operator.Views.Edit({id:id}));
        },

        subjectList: function() {
            this.loadView(new Subject.Views.List());
        },

        subjectEdit: function(id) {
            var dataTypes = new DataType.List();
            var projects = new Project.List();
            var _this = this;
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
                        dataTypes: dataTypes
                    }));    
                }
            });
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
