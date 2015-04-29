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
    var Biobank = xtens.module("biobank");
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
            "biobanks": "biobankList",
            "biobanks/new": "biobankEdit",
            "biobanks/edit/:id": "biobankEdit",
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

        },

        loadView: function(view) {
            // remove previous bb view(s)
            this.view && this.view.remove();

            // load new view
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
            }, xtens.error);
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
            }, xtens.error);
        },

        dataTypeList: function() {
            this.loadView(new DataType.Views.List());
        },

        dataTypeEdit: function(id) {
            var model, _this = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({
                success: function(dataTypes) {
                    if (id) {
                        model = dataTypes.get(id);
                    }
                    else {
                        model = new DataType.Model();
                    }
                    _this.loadView(new DataType.Views.Edit({id: id, dataTypes: dataTypes.toJSON(), model: model}));
                },
                error: function(model, res) {
                    xtens.error(res);
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
            }, function(jqxhr) {
                xtens.error(jqxhr);
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
                    xtens.error(err);
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
            }, function(jqxhr) {
                xtens.error(jqxhr);
            });
        },

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
                    xtens.error(err);
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
            }, function(jqxhr) {
                xtens.error(jqxhr);
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
                error: function(jqxhr) {
                    xtens.error(jqxhr);
                }
            });
        },

        biobankList: function() {
            this.loadView(new Biobank.Views.List());
        },
        
        biobankEdit: function(id) {
            if (id) {
                var biobank = new Biobank.Model({id: id}), that = this;
                biobank.fetch({
                    success: function(biobank) {
                        that.loadView(new Biobank.Views.Edit({
                            model: biobank
                        }));
                    },
                    error: function(model, res) {
                        xtens.error(res);
                    }
                });
            }
            else {
                this.loadView(new Biobank.Views.Edit({model: new Biobank.Model()}));
            }
        },
                
        queryBuilder: function(id) {
            var dataTypes = new DataType.List();
            var that = this;
            dataTypes.fetch({
                data: $.param({
                    populate: ['children']
                }),
                success: function(dataTypes) {
                    console.log(dataTypes);
                    that.loadView(new Query.Views.Builder({
                        id: _.parseInt(id),
                        dataTypes: dataTypes
                    }));    
                },
                error: function(model, res) {
                    xtens.error(res);
                }
            });
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
