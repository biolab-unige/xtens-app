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
    var FileManager= xtens.module("FileManager");

    function parseQueryString(queryString){
        var params = {};
        if(queryString){
            _.each(
                _.map(decodeURI(queryString).split(/&/g),function(el,i){
                var aux = el.split('='), o = {};
                if(aux.length >= 1){
                    var val = null;
                    if(aux.length == 2)
                        val = aux[1];
                    o[aux[0]] = val;
                }
                return o;
            }),
            function(o){
                _.extend(params,o);
            }
            );
        }
        return params;
    }

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
            "data/new/:skipme?*queryString": "dataEdit",
            "data/edit/:id": "dataEdit",
            "subjects": "subjectList",
            "subjects/new": "subjectEdit",
            "subjects/new/:skipme?*queryString": "subjectEdit",
            "subjects/edit/:id": "subjectEdit",
            "samples": "sampleList",
            "samples/new": "sampleEdit",
            "samples/new/:skipme?*queryString": "sampleEdit",
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
            "groups/datatype/:id":"associationDataType",
            "upload-file":"uploadView",
            "download-file":"downloadView"

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
            var dataTypes = new DataType.List();
            var data = new Data.List();
            var _this = this;
            var $dataTypesDeferred = dataTypes.fetch();
            var $dataDeferred = data.fetch();
            $.when($dataTypesDeferred, $dataDeferred).then(function(dataTypesRes, dataRes) {
                _this.loadView(new Data.Views.List({
                    data: new Data.List(dataRes[0]),
                    dataTypes: new DataType.List(dataTypesRes[0])    
                }));
            }, function() {
                alert("Error retrieving data from the server");
            });
            // this.loadView(new Data.Views.List());
        },

        dataEdit: function(id, queryString) {
            // var dataTypes = new DataType.List(); 
            var params = parseQueryString(queryString);
            if (id && _.parseInt(id) > 0) {
                params.id = id;
            }
            // var dataTypeParams = { classTemplate: xtens.module("xtensconstants").DataTypeClasses.GENERIC };
            var _this = this;
            $.ajax({ 
                url: '/data/edit', 
                type: 'GET',
                data: params,
                contentType: 'application/json', 
                success: function(results) {
                    _this.loadView(new Data.Views.Edit(results));
                },
                error: function(err) {
                    alert(err);
                }
            });
        },


        downloadView:function(){
            this.loadView(new FileManager.Views.Download());
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
            var dataTypes = new DataType.List();
            var subjects = new Subject.List();
            var _this = this;
            var $dataTypesDeferred = dataTypes.fetch();
            var $subjectsDeferred = subjects.fetch();
            $.when($dataTypesDeferred, $subjectsDeferred).then(function(dataTypesRes, subjectsRes) {
                _this.loadView(new Subject.Views.List({
                    subjects: new Subject.List(subjectsRes[0]),
                    dataTypes: new DataType.List(dataTypesRes[0])    
                }));
            }, function() {
                alert("Error retrieving data from the server");
            });
        },

        /*
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
                    id: _.parseInt(id), 
                    projects: projectsRes[0],
                    model: model
                }));
            }, function() {
                alert("Error retrieving data from the server");
            });
        }, */
        
        subjectEdit: function(id) {
            var params = {};
            if (id && _.parseInt(id) > 0) {
                params.id = id;
            }
            var _this = this;
            $.ajax({ 
                url: '/subject/edit', 
                type: 'GET',
                data: params,
                contentType: 'application/json; charset=utf-8', 
                success: function(results) {
                    _this.loadView(new Subject.Views.Edit(results));
                },
                error: function(err) {
                    alert(err);
                }
            });
        },

        sampleList: function() {
            var dataTypes = new DataType.List();
            var samples = new Sample.List();
            var _this = this;
            var $dataTypesDeferred = dataTypes.fetch();
            var $samplesDeferred = samples.fetch();
            $.when($dataTypesDeferred, $samplesDeferred).then( function(dataTypesRes, samplesRes) {
                _this.loadView(new Sample.Views.List({ 
                    samples: new Sample.List(samplesRes[0]),
                    dataTypes: new DataType.List(dataTypesRes[0])                                    
                }));
            }, function() {
                alert("Error retrieving data from the server");
            });
        },

        sampleEdit: function(id, queryString) {
            var params = parseQueryString(queryString);
            if (id && _.parseInt(id) > 0) {
                params.id = id;
            }
            var _this = this;
            $.ajax({ 
                url: '/sample/edit', 
                type: 'GET',
                data: params,
                contentType: 'application/json; charset=utf-8', 
                success: function(results) {
                    _this.loadView(new Sample.Views.Edit(results));
                },
                error: function(err) {
                    alert(err);
                }
            });
        },

 uploadView:function(){
            this.loadView(new FileManager.Views.Upload());
        },
        /*
        sampleEdit: function(id, queryParams) {
            var dataTypes = new DataType.List(), subjects = new Subject.List(), samples = new Sample.List();
            var param = parseQueryString(queryParams);
            var SAMPLE = xtens.module("xtensconstants").DataTypeClasses.SAMPLE;
            var dataTypeParams = { classTemplate: SAMPLE };
            var sampleParams, subjectParams;
            if (param.hasOwnProperty('parentSample')) {
                sampleParams = {id: param.parentSample};
            }
            if (param.hasOwnProperty('donor')) {
                subjectParams = {id: param.donor};
            }
            var _this = this;
            var $dataTypesDeferred = dataTypes.fetch({ data: dataTypeParams ? $.param(dataTypeParams) : null });
            var $subjectsDeferred = subjects.fetch({ data: subjectParams ? $.param(subjectParams) : null });
            var $samplesDeferred = samples.fetch({ data: sampleParams ? $.param(sampleParams) : null });
            $.when($dataTypesDeferred, $subjectsDeferred, $samplesDeferred)
            .then(function(dataTypesRes, subjectsRes, samplesRes) {
                var model = new Sample.Model();
                if (param.hasOwnProperty('idDataTypes')) {
                    var ids = _.map(param.idDataTypes.split(","), function(el) { return _.parseInt(el); });
                    dataTypesRes[0] = _.filter(dataTypesRes[0], function(dataType) {
                        return ids.indexOf(dataType.id) > -1;
                    });
                }
                _this.loadView(new Sample.Views.Edit({
                    id: _.parseInt(id),
                    dataTypes: new Data.List(dataTypesRes[0]),
                    subjects: new Subject.List(subjectsRes[0]),
                    samples: new Sample.List(samplesRes[0]),
                    model: model
                }));
            });
        }, */

        queryBuilder: function(id) {
            var dataTypes = new DataType.List();
            var that = this;
            dataTypes.fetch({
                success: function(dataTypes) {
                    that.loadView(new Query.Views.Builder({
                        id: _.parseInt(id),
                        dataTypes: dataTypes
                    }));    
                }
            });
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
