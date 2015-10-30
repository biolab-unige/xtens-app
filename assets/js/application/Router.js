/**
 * @author  Massimiliano Izzo
 * @description This is the main Backbone router for XTENS web client
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
    var FileManager= xtens.module("filemanager");

    /**
     * @method
     * @name parseQueryString
     * @private
     * @description parses a query string (key1=val1&key2=val2...) and returns an object {key1:val1, key2:val2}
     * @param{string} queryString
     * @returns{Object} an object containing key-value pairs
     *
     */
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
     * @class
     * @name XtensRouter
     * @description XTENS Router for Backbone
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
            "data/details/:id": "dataDetails",
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
            "query/:queryString": "queryBuilder",
            "query/dataSearch?*queryString": "performAdvancedSearch",
            "operators": "operatorList",
            "operators/new": "operatorEdit",
            "operators/edit/:id": "operatorEdit",
            "groups":"groupList",
            "groups/new":"groupEdit",
            "groups/edit/:id":"groupEdit",
            "login":"logIn",
            "logout":"logOut",
            "groups/operator/:id":"associationOperator",
            "groups/datatype/:id":"associationDataType",
            "downIrods":"downIrods",
            "datatypes/graph":"dataTypeGraph",
            "subjects/graph":"subjectGraph",
            "homepage":"homepage",
            "file-download/:id": "downloadFile"
        },

        publicRoutes: ["login"],

        /**
         * @method
         * @name execute
         * @extends Backbone.Router.execute
         */
        execute: function(callback, args, name) {
            /* Router BEFORE HOOK */
            // if the user is not authenticated redirect to login page
            var isAuth = xtens.session.isAuthenticated();
            // console.log(Backbone.history.getFragment());
            var path = Backbone.history.getFragment();
            var restricted = !_.contains(this.publicRoutes, path);

            if (restricted && !isAuth) {
                this.navigate('login', {trigger: true});
                return false;
            }

            if (callback) {
                callback.apply(this, args);
            }

        },

        loadView: function(view) {
            // remove previous bb view(s)
            this.view && this.view.remove();

            // load new view
            this.view = view; 
        },

        associationDataType:function(id){
            var that = this;
            var dominant = new Group.Model({id:id});
            var nondominant = new DataType.List();
            $.when(nondominant.fetch(),dominant.fetch()).then(function(nondominantRes, dominantRes) {
                that.loadView(new AdminAssociation.Views.Edit({
                    dominant:new Group.Model(dominantRes && dominantRes[0]),
                    nondominant: nondominantRes && nondominantRes[0],
                    nondominantName:'dataTypes',
                    field:'name'
                }));
            }, xtens.error);
        },

        associationOperator: function(id){
            var that = this;
            var dominant = new Group.Model({id:id});
            var nondominant = new Operator.List();
            $.when(nondominant.fetch(),dominant.fetch()).then(function(nondominantRes, dominantRes){
                that.loadView(new AdminAssociation.Views.Edit({
                    dominant:new Group.Model(dominantRes && dominantRes[0]),
                    nondominant: nondominantRes && nondominantRes[0],
                    nondominantName:'members',
                    field:'login'
                }));
            }, xtens.error);
        },

        dataTypeList: function() {
            this.loadView(new DataType.Views.List());
        },

        downIrods: function() {
            this.loadView(new FileManager.Views.Download());
        },

        dataTypeGraph : function() {
            this.loadView(new DataType.Views.Graph());
        },

        /**
         * @method
         * @name dataTypeEdit
         * @description retrieved a dataType a renders its Edit View
         * @param{Integer} id - the dataType ID
         */
        dataTypeEdit: function(id) {
            var model, that = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({
                success: function(dataTypes) {
                    if (id) {
                        model = dataTypes.get(id);
                    }
                    else {
                        model = new DataType.Model();
                    }
                    that.loadView(new DataType.Views.Edit({id: id, dataTypes: dataTypes.toJSON(), model: model}));
                },
                error: function(model, res) {
                    xtens.error(res);
                }
            });
        },

        /**
         * @method
         * @name dataList
         * @param{string} queryString - a query string containing parameters to filter the sample search
         *                      allowed params are:
         *                      donor [integer] - ID of subject
         *                      parentSample [integer] - ID of the parent sample (if derivative)
         *                      type [integer] - ID of the sample type
         * @description retrieve a list of semples (optionally filtered by a set of parameters sent as query string)
         *              and load them on a view
         */

        dataList: function(queryString) {
            var queryParams = parseQueryString(queryString);
            var dataTypes = new DataType.List();
            var data = new Data.List();
            var that = this;
            var $dataTypesDeferred = dataTypes.fetch({
                data: $.param({ populate: ['children'] })
            });
            var $dataDeferred = data.fetch({
                data: $.param(queryParams)
            });
            $.when($dataTypesDeferred, $dataDeferred).then(function(dataTypesRes, dataRes) {
                that.loadView(new Data.Views.List({
                    data: new Data.List(dataRes && dataRes[0]),
                    dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0])    
                }));
            }, function(jqxhr) {
                xtens.error(jqxhr);
            });
            // this.loadView(new Data.Views.List());
        },

        /**
         * @method
         * @name dataEdit
         * @param{integer} id - the sample ID
         * @param{string} queryString
         * @description retrieve the data model and open Edit view
         */
        dataEdit: function(id, queryString) {
            // var dataTypes = new DataType.List(); 
            var params = parseQueryString(queryString);
            if (id && _.parseInt(id) > 0) {
                params.id = id;
            }
            // var dataTypeParams = { classTemplate: xtens.module("xtensconstants").DataTypeClasses.GENERIC };
            var that = this;
            $.ajax({ 
                url: '/data/edit', 
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: params,
                contentType: 'application/json', 
                success: function(results) {
                    that.loadView(new Data.Views.Edit(results));
                },
                error: function(err) {
                    xtens.error(err);
                }
            });
        },

        /**
         * @name dataDetails
         * @description retrieve the data model and open the Details view
         */
        dataDetails: function(id) {
            var that = this, model = new Data.Model({id: id});
            model.fetch({
                success: function(data) {
                    that.loadView(new Data.Views.Details({model: data})); 
                },
                error: function(model, res) {
                    xtens.error(res);
                }
            });
        },


        downloadView:function() {
            this.loadView(new FileManager.Views.Download());
        },

        groupList:function() {
            this.loadView(new Group.Views.List());
        },

        /**
         * @method
         * @name groupEdit
         * @description retrieved a user group a renders its Edit View
         * @param{Integer} id - the user group ID
         */
        groupEdit:function(id) {
            var group = new Group.Model(), that = this;
            if (id) {
                group.set('id', id);
                group.fetch({
                    success: function(group) {
                        that.loadView(new Group.Views.Edit({
                            model: group
                        }));
                    },

                    error: function(group, res) {
                        xtens.error(res);
                    }
                });
            }
            else {
                this.loadView(new Group.Views.Edit({model: group}));
            }
        },

        homepage:function() {
            this.loadView(new Operator.Views.Homepage());
        },

        logIn: function() {
            this.loadView(new Operator.Views.Login());
        },

        logOut: function() {
            xtens.session.reset();
            this.navigate('login', {trigger: true});
        },

        operatorList:function() {
            this.loadView(new Operator.Views.List());
        },

        operatorEdit:function(id) {
            this.loadView(new Operator.Views.Edit({id:id}));
        },

        subjectList: function() {
            var dataTypes = new DataType.List();
            var subjects = new Subject.List();
            var that = this;
            var $dataTypesDeferred = dataTypes.fetch({
                data: $.param({ populate: ['children'] })
            });
            var $subjectsDeferred = subjects.fetch();
            $.when($dataTypesDeferred, $subjectsDeferred).then(function(dataTypesRes, subjectsRes) {
                that.loadView(new Subject.Views.List({
                    subjects: new Subject.List(subjectsRes && subjectsRes[0]),
                    dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0])    
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
            var that = this;
            $.ajax({ 
                url: '/subject/edit', 
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: params,
                contentType: 'application/json; charset=utf-8', 
                success: function(results) {
                    that.loadView(new Subject.Views.Edit(results));
                },
                error: function(err) {
                    xtens.error(err);
                }
            });
        },

        subjectGraph: function() {
            this.loadView(new Subject.Views.Graph());
        },

        /**
         * @method
         * @name sampleList
         * @param queryString - a query string containing parameters to filter the sample search
         *                      allowed params are:
         *                      donor [integer] - ID of subject
         *                      parentSample [integer] - ID of the parent sample (if derivative)
         *                      type [integer] - ID of the sample type
         * @description retrieve a list of semples (optionally filtered by a set of parameters sent as query string)
         *              and load them on a view
         */
        sampleList: function(queryString) {
            var queryParams = parseQueryString(queryString);
            var dataTypes = new DataType.List();
            var samples = new Sample.List();
            var that = this;
            var $dataTypesDeferred = dataTypes.fetch({
                data: $.param({populate:['children']})
            });
            var $samplesDeferred = samples.fetch({
                data: $.param(queryParams)
            });
            $.when($dataTypesDeferred, $samplesDeferred).then( function(dataTypesRes, samplesRes) {
                that.loadView(new Sample.Views.List({ 
                    samples: new Sample.List(samplesRes && samplesRes[0]),
                    dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0])                                    
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
            var that = this;
            $.ajax({ 
                url: '/sample/edit', 
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: params,
                contentType: 'application/json; charset=utf-8', 
                success: function(results) {
                    that.loadView(new Sample.Views.Edit(results));
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

        queryBuilder: function(queryString) {
            var params = queryString ? JSON.parse(queryString) : undefined;
            console.log(params);
            var dataTypes = new DataType.List();
            var biobanks = new Biobank.List();
            var $dataTypesDeferred = dataTypes.fetch({
                data: $.param({populate:['children']})
            });
            var $biobanksDeferred = biobanks.fetch();
            var that = this;
            $.when($dataTypesDeferred, $biobanksDeferred).then( function(dataTypesRes, biobanksRes) {
                that.loadView(new Query.Views.Builder({
                    queryObj: params && params.queryArgs,
                    biobanks: new Biobank.List(biobanksRes && biobanksRes[0]),
                    dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0])                                    
                }));
            }, function(jqxhr) {
                xtens.error(jqxhr);
            });
            /*
               dataTypes.fetch({
data: $.param({
populate: ['children']
}),
success: function(dataTypes) {
console.log(dataTypes);
that.loadView(new Query.Views.Builder({
            // id: _.parseInt(id),
queryObj: params && params.queryArgs,
dataTypes: dataTypes
}));    
},
error: function(model, res) {
xtens.error(res);
}
}); */
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
