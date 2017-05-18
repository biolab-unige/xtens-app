/**
 * @author  Massimiliano Izzo
 * @description This is the main Backbone router for XTENS web client
 */

(function(xtens) {

    var DataType = xtens.module("datatype");
    var Data = xtens.module("data");
    var Subject = xtens.module("subject");
    var Project = xtens.module("project");
    var Sample = xtens.module("sample");
    var Biobank = xtens.module("biobank");
    var Query = xtens.module("query");
    var Operator = xtens.module("operator");
    var Group = xtens.module("group");
    var AdminAssociation = xtens.module("adminassociation");
    var DataTypePrivileges = xtens.module("datatypeprivileges");
    var FileManager= xtens.module("filemanager");
    var Session = xtens.module("session");

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
            "subjects/details/:id": "subjectDetails",
            "samples": "sampleList",
            "samples/new": "sampleEdit",
            "samples/new/:skipme?*queryString": "sampleEdit",
            "samples/edit/:id": "sampleEdit",
            "samples/details/:id": "sampleDetails",
            "biobanks": "biobankList",
            "biobanks/new": "biobankEdit",
            "biobanks/edit/:id": "biobankEdit",
            "query": "queryBuilder",
            "query/:queryString": "queryBuilder",
            "query/dataSearch?*queryString": "performAdvancedSearch",
            "operators": "operatorList",
            "operators/new": "operatorEdit",
            "operators/edit/:id": "operatorEdit",
            "operators/updatePassword": "updatePassword",
            "groups":"groupList",
            "groups/new":"groupEdit",
            "groups/edit/:id":"groupEdit",
            "login":"logIn",
            "logout":"logOut",
            "groups/operator/:id": "associationOperator",
            "projects":"projectList",
            "projects/new":"projectEdit",
            "projects/edit/:id":"projectEdit",
            "datatypeprivileges": "dataTypePrivilegesList",
            "datatypeprivileges/edit/:id": "dataTypePrivilegesEdit",
            "datatypeprivileges/new": "dataTypePrivilegesEdit",
            "datatypeprivileges/new/:skipme?*queryString": "dataTypePrivilegesEdit",
            "downIrods":"downIrods",
            "datatypes/graph":"dataTypeGraph",
            "subjects/graph":"subjectGraph",
            "homepage":"homepage",
            "file-download/:id": "downloadFile",
            "data/dedicated": "dedicatedDataManagement"
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

            if (restricted) {
                if (!isAuth) {
                    this.navigate('login', {trigger: true});
                    return false;
                }
                else if (!this.menuBarView || this.menuBarView.$el.children().length < 1) {
                    this.menuBarView = new Session.Views.MenuBar();
                }
            }

            if (callback) {
                callback.apply(this, args);
            }

        },

        /**
         * @method
         * @name loadView
         * @description method to remove all previously existing views before loading a new one
         */
        loadView: function(view) {
            // remove previous bb view(s)
            this.view && this.view.remove();

            // load new view
            this.view = view;
        },

        /**
         * @method
         * @name dataTypePrivilegesList
         * @description opens the list view for DataTypePrivileges
         * @param{object} groupId - the ID of the user group
         */
        dataTypePrivilegesList: function(queryString) {
            var queryParams = parseQueryString(queryString);
            var privilegesParams = {sort:'id ASC', populate:['dataType','group'], limit:100};
            queryParams.groupId ? privilegesParams.group = queryParams.groupId : null;
            queryParams.dataTypeId ? privilegesParams.dataType = queryParams.dataTypeId : null;
            var that = this;
            var group = new Group.Model(queryParams.groupId ? {id: queryParams.groupId} : {});
            var privileges = new DataTypePrivileges.List();
            var dataTypes = new DataType.List(queryParams.dataTypeId ? {id: queryParams.dataTypeId} : {});
            var groupDeferred = group.fetch({
                data: $.param({populate: ['dataTypes','projects']})
            });
            var privilegesDeferred = privileges.fetch({
                data: $.param(privilegesParams)
            });
            var dataTypesDeferred = dataTypes.fetch({
                data: $.param({populate:['project']})
            });

            $.when(groupDeferred, privilegesDeferred, dataTypesDeferred).then(function(groupRes, privilegesRes, dataTypesRes) {
                that.loadView(new DataTypePrivileges.Views.List({
                    params : queryParams,
                    group: new Group.Model(groupRes && groupRes[0]),
                    privileges: new DataTypePrivileges.List(privilegesRes && privilegesRes[0]),
                    dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0])
                }));
            });
        },

        /**
         * @method
         * @name dataTypePrivilegesEdit
         * @description opens the view to create/edit DataTypePrivileges for a user group
         * @param{integer} dataTypePrivilegesId - the ID of the dataTypePrivileges
         */
        dataTypePrivilegesEdit: function(id, queryString) {
            // var dataTypes = new DataType.List();
            var params = parseQueryString(queryString);
            if (id && _.parseInt(id) > 0) {
                params.id = id;
            }
            var that = this;
            $.ajax({
                url: '/dataTypePrivileges/edit',
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: params,
                contentType: 'application/json',
                success: function(results) {
                    results.params = params;
                    that.loadView(new DataTypePrivileges.Views.Edit(results));
                },
                error: function(err) {
                    xtens.error(err);
                }
            });
        },

        /**
         * @method
         * @name associationOperator
         * @description opens the view to edit operators for each user group
         * @param{integer} id - the ID of the user group
         */
        associationOperator: function(id){
            var that = this;
            var group = new Group.Model({id:id});
            var members = new Operator.List();
            var groupDeferred = group.fetch({
                data: $.param({populate:['members']})
            });
            $.when(members.fetch(),groupDeferred).then(function(membersRes, groupRes){
                that.loadView(new AdminAssociation.Views.Edit({
                    dominant:new Group.Model(groupRes && groupRes[0]),
                    nondominant: membersRes && membersRes[0],
                    nondominantName:'members',
                    field:'login'
                }));
            }, xtens.error);
        },

        /**
         * @method
         * @name dataTypeList
         * @description opens the list view of all existing dataTypes
         */
        dataTypeList: function(queryString) {
            var that = this;
            var queryParams = parseQueryString(queryString);
            var dataTypes = new DataType.List();

            dataTypes.fetch({
                data:$.param({populate:['project','parents'], sort: 'id ASC'}),
                success: function(dataTypes) {
                    var adminProjects = xtens.session.get("adminProjects");
                    dataTypes.models = _.filter(dataTypes.models,function (dt) {
                        if(_.find(adminProjects, function(pr){ return pr === dt.get("project").id;})){
                            return dt;
                        }
                    });
                    that.loadView(new DataType.Views.List({queryParams: queryParams, dataTypes: dataTypes}));
                },
                error: function(err) {
                    xtens.error(err);
                }
            });
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
            var params = parseQueryString(id);

            var model, that = this;
            var dataTypes = new DataType.List();
            $.ajax({
                url: '/dataType/edit',
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: {id: params.duplicate ? params.duplicate : id},
                contentType: 'application/json',
                success: function(results) {
                    params.duplicate ? results.params = params : null;
                    that.loadView(new DataType.Views.Edit(results));
                },
                error: function(err) {
                    xtens.error(err);
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
            var privileges = new DataTypePrivileges.List();
            var data = new Data.List();
            var operator = new Operator.List();
            var that = this;


            var $operatorDeferred = operator.fetch({
                data: $.param({login: xtens.session.get("login"), populate: ['groups']})
            });

            $.when($operatorDeferred).then(function(operatorRes) {
                var groupId = operatorRes && operatorRes[0].groups[0].id;
                var $dataTypesDeferred = dataTypes.fetch({
                    data: $.param({ populate: ['children'] })
                });
                var $privilegesDeferred = privileges.fetch({
                    data: $.param({group: groupId, limit:100})
                });

                // var $dataDeferred = data.fetch({
                //     data: $.param(_.assign(_.omit(queryParams, ['parentDataType', 'parentSubjectCode']), { // omit "parentSubjectCode" as param in server-side GET request
                //         populate: ['type'],
                //         limit: xtens.module("xtensconstants").DefaultLimit
                //         sort: 'created_at DESC'
                //     }))
                // });

                $.when($dataTypesDeferred, $privilegesDeferred).then(function(dataTypesRes, privilegesRes) {
                    var idProject = xtens.session.get('activeProject') !== 'all' ? _.find(xtens.session.get('projects'),function (p) { return p.name === xtens.session.get('activeProject'); }).id : undefined;
                    $.ajax({
                        url: '/data',
                        type: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                        },
                        data: {
                            parentData: queryParams.parentData,
                            parentSample: queryParams.parentSample,
                            parentSubject: queryParams.parentSubject,
                            project: idProject,
                            populate: ['type'],
                            limit: xtens.module("xtensconstants").DefaultLimit
,
                            sort: 'created_at DESC'
                        },
                        contentType: 'application/json',
                        success: function(results, options, res) {
                            var headers = {
                                'Link': xtens.parseLinkHeader(res.getResponseHeader('Link')),
                                'X-Total-Count': parseInt(res.getResponseHeader('X-Total-Count')),
                                'X-Page-Size': parseInt(res.getResponseHeader('X-Page-Size')),
                                'X-Total-Pages': parseInt(res.getResponseHeader('X-Total-Pages')),
                                'X-Current-Page': parseInt(res.getResponseHeader('X-Current-Page')) + 1
                            };
                            var startRow = (headers['X-Page-Size']*parseInt(res.getResponseHeader('X-Current-Page')))+1;
                            var endRow = headers['X-Page-Size']*headers['X-Current-Page'];
                            headers['startRow'] = startRow;
                            headers['endRow'] = endRow;
                            that.loadView(new Data.Views.List({
                                dataTypePrivileges: new DataTypePrivileges.List(privilegesRes && privilegesRes[0]),
                                data: new Data.List(results),
                                dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0]),
                                params: queryParams,
                                paginationHeaders: headers
                            }));
                        },
                        error: function(err) {
                            xtens.error(err);
                        }
                    });

                }, function(jqxhr) {
                    xtens.error(jqxhr);
                });
            // this.loadView(new Data.Views.List());
            }
          , function(jqxhr) {
                xtens.error(jqxhr);
            });
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
            if(xtens.session.get('activeProject') !== 'all'){
                params.project = _.parseInt(_.find(xtens.session.get('projects'),{name: xtens.session.get('activeProject')} ).id);
            }
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
         * @method
         * @name dataDetails
         * @description retrieve the data model and open the Details view
         */
        dataDetails: function(id) {
            var that = this, model = new Data.Model({id: id});
            model.fetch({
                data: $.param({populate: ['type', 'files', 'parentSample', 'parentSubject']}),
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

        groupList:function(queryString) {
            var that = this;
            var queryParams = parseQueryString(queryString);
            var groups = new Group.List();

            groups.fetch({
                data:$.param({populate:['projects'], sort: 'id ASC'}),
                success: function(groups) {
                    that.loadView(new Group.Views.List({queryParams: queryParams, groups: groups.models}));
                },
                error: function(err) {
                    xtens.error(err);
                }
            });
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
            if (this.menuBarView && this.menuBarView.$el.children().length > 0) {
                this.menuBarView.$el.children().remove();
            }
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

            var that = this;
            var operator = new Operator.Model();
            if (id) {
                operator.set('id', id);
                operator.fetch({
                    success: function(operator) {
                        that.loadView(new Operator.Views.Edit({model: operator}));
                    },
                    error: function(err) {
                        xtens.error(err);
                    }
                });
            }
            else {
                this.loadView(new Operator.Views.Edit({model: operator}));
            }
        },

        /**
         * @method
         * @name projectEdit
         * @description retrieved a user project a renders its Edit View
         * @param{Integer} id - the user project ID
         */
        projectEdit:function(id) {
            var that = this;

            $.ajax({
                url: '/project/edit',
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: {id:id},
                contentType: 'application/json',
                success: function(results) {
                    that.loadView(new Project.Views.Edit(results));
                },
                error: function(err) {
                    xtens.error(err);
                }
            });
        },

        projectList:function() {
            this.loadView(new Project.Views.List());
        },

        updatePassword:function() {
            this.loadView(new Operator.Views.updatePassword());
        },

        subjectList: function() {
            var privileges = new DataTypePrivileges.List();
            var operator = new Operator.List();
            var dataTypes = new DataType.List();
            var subjects = new Subject.List();
            var that = this;
            var $operatorDeferred = operator.fetch({
                data: $.param({login: xtens.session.get("login"), populate: ['groups']})
            });

            $.when($operatorDeferred).then(function(operatorRes) {
                var groupId = operatorRes && operatorRes[0].groups[0].id;
                var $privilegesDeferred = privileges.fetch({
                    data: $.param({group: groupId, limit:100})
                });
                var $dataTypesDeferred = dataTypes.fetch({
                    data: $.param({ populate: ['children'] })
                });
                $.when($dataTypesDeferred, $privilegesDeferred).then(function(dataTypesRes, privilegesRes) {
                    var idProject = xtens.session.get('activeProject') !== 'all' ? _.find(xtens.session.get('projects'),function (p) { return p.name === xtens.session.get('activeProject'); }).id : undefined;
                    $.ajax({
                        url: '/subject',
                        type: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                        },
                        data: {
                            project: idProject,
                            populate: ['type'],
                            limit: xtens.module("xtensconstants").DefaultLimit,
                            sort: 'created_at DESC'
                        },
                        contentType: 'application/json',
                        success: function(results, options, res) {
                            var headers = {
                                'Link': xtens.parseLinkHeader(res.getResponseHeader('Link')),
                                'X-Total-Count': parseInt(res.getResponseHeader('X-Total-Count')),
                                'X-Page-Size': parseInt(res.getResponseHeader('X-Page-Size')),
                                'X-Total-Pages': parseInt(res.getResponseHeader('X-Total-Pages')),
                                'X-Current-Page': parseInt(res.getResponseHeader('X-Current-Page')) + 1
                            };
                            var startRow = (headers['X-Page-Size']*parseInt(res.getResponseHeader('X-Current-Page')))+1;
                            var endRow = headers['X-Page-Size']*headers['X-Current-Page'];
                            headers['startRow'] = startRow;
                            headers['endRow'] = endRow;
                            that.loadView(new Subject.Views.List({
                                dataTypePrivileges: new DataTypePrivileges.List(privilegesRes && privilegesRes[0]),
                                subjects: new Subject.List(results),
                                dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0]),
                                paginationHeaders: headers
                            }));
                        },
                        error: function(err) {
                            xtens.error(err);
                        }
                    });

                }, function(jqxhr) {
                    xtens.error(jqxhr);
                });
            }, function(jqxhr) {
                xtens.error(jqxhr);
            });
        },

        subjectEdit: function(id) {
            var params = {};
            if (id && _.parseInt(id) > 0) {
                params.id = id;
            }
            if(xtens.session.get('activeProject') !== 'all'){
                params.project = _.parseInt(_.find(xtens.session.get('projects'),{name: xtens.session.get('activeProject')} ).id);
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

        /**
         * @method
         * @name subjectDetails
         * @description retrieve the subject model and open the Details view
         * @param{integer} id - sample Id
         */
        subjectDetails: function(id) {
            var that = this, model = new Subject.Model({id: id});
            model.fetch({
                data: $.param({populate: ['type', 'projects']}),
                success: function(subject) {
                    that.loadView(new Subject.Views.Details({model: subject}));
                },
                error: function(model, res) {
                    xtens.error(res);
                }
            });
        },

        /**
         * @method
         * @name subjectGraph
         */
        subjectGraph: function(queryString) {
            var that = this;
            var queryParams = parseQueryString(queryString);
            if (queryParams.idPatient) {
                this.loadView(new Subject.Views.Graph({
                    idPatient: queryParams.idPatient
                }));
                return;
            }
            var dataTypes = new DataType.List();

            // var $dataTypesDeferred = dataTypes.fetch({
            //     data: $.param({ populate: ['children'] })
            // });
            // $.when($dataTypesDeferred).then(function(dataTypesRes) {
            var idProject = xtens.session.get('activeProject') !== 'all' ? _.find(xtens.session.get('projects'),function (p) { return p.name === xtens.session.get('activeProject'); }).id : undefined;
            $.ajax({
                url: '/subject',
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: {
                    project: idProject,
                    populate: ['type'],
                    limit: 10000,
                    sort: 'created_at ASC'
                },
                contentType: 'application/json',
                success: function(results, options, res) {
                    that.loadView(new Subject.Views.Graph({
                            // dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0]),
                        subjects: new Subject.List(results)
                    }));
                },
                error: function(err) {
                    xtens.error(err);
                }
            });

            // }, function(jqxhr) {
            //     xtens.error(jqxhr);
            // });
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
            var privileges = new DataTypePrivileges.List();
            var operator = new Operator.List();
            var dataTypes = new DataType.List();
            var that = this;
            var $operatorDeferred = operator.fetch({
                data: $.param({login: xtens.session.get("login"), populate: ['groups']})
            });

            $.when($operatorDeferred).then( function(operatorRes) {
                var groupId = operatorRes && operatorRes[0].groups[0].id;
                var $privilegesDeferred = privileges.fetch({
                    data: $.param({group: groupId, limit:100})
                });
                var $dataTypesDeferred = dataTypes.fetch({
                    data: $.param({populate:['children']})
                });

                $.when($dataTypesDeferred, $privilegesDeferred).then( function(dataTypesRes, privilegesRes) {
                    var idProject = xtens.session.get('activeProject') !== 'all' ? _.find(xtens.session.get('projects'),function (p) { return p.name === xtens.session.get('activeProject'); }).id : undefined;

                    $.ajax({
                        url: '/sample',
                        type: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                        },
                        data: {
                            donor: queryParams.donor,
                            parentData: queryParams.parentData,
                            parentSample: queryParams.parentSample,
                            project: idProject,
                            populate: ['type', 'donor'],
                            limit: xtens.module("xtensconstants").DefaultLimit
,
                            sort: 'created_at DESC'
                        },
                        contentType: 'application/json',
                        success: function(results, options, res) {
                            var headers = {
                                'Link': xtens.parseLinkHeader(res.getResponseHeader('Link')),
                                'X-Total-Count': parseInt(res.getResponseHeader('X-Total-Count')),
                                'X-Page-Size': parseInt(res.getResponseHeader('X-Page-Size')),
                                'X-Total-Pages': parseInt(res.getResponseHeader('X-Total-Pages')),
                                'X-Current-Page': parseInt(res.getResponseHeader('X-Current-Page')) + 1
                            };
                            var startRow = (headers['X-Page-Size']*parseInt(res.getResponseHeader('X-Current-Page')))+1;
                            var endRow = headers['X-Page-Size']*headers['X-Current-Page'];
                            headers['startRow'] = startRow;
                            headers['endRow'] = endRow;
                            that.loadView(new Sample.Views.List({
                                dataTypePrivileges: new DataTypePrivileges.List(privilegesRes && privilegesRes[0]),
                                samples: new Sample.List(results),
                                dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0]),
                                params: queryParams,
                                paginationHeaders: headers
                            }));
                        },
                        error: function(err) {
                            xtens.error(err);
                        }
                    });
                }, function(jqxhr) {
                    xtens.error(jqxhr);
                });
            }, function(jqxhr) {
                xtens.error(jqxhr);
            });
        },

        /**
         * @method
         * @name sampleEdit
         * @param{integer} id - Sample Id
         * @param{string} queryString
         */
        sampleEdit: function(id, queryString) {
            var params = parseQueryString(queryString);
            if (id && _.parseInt(id) > 0) {
                params.id = id;
            }
            if(xtens.session.get('activeProject') !== 'all'){
                params.project = _.parseInt(_.find(xtens.session.get('projects'),{name: xtens.session.get('activeProject')} ).id);
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
                    results.params = params;
                    that.loadView(new Sample.Views.Edit(results));
                },
                error: function(jqxhr) {
                    xtens.error(jqxhr);
                }
            });
        },

         /**
         * @method
         * @name sampleDetails
         * @description retrieve the sample model and open the Details view
         * @param{integer} id - sample Id
         */
        sampleDetails: function(id) {
            var that = this, model = new Sample.Model({id: id});
            model.fetch({
                data: $.param({populate: ['type', 'files', 'parentSample', 'biobank', 'donor']}),
                success: function(sample) {
                    that.loadView(new Sample.Views.Details({model: sample}));
                },
                error: function(model, res) {
                    xtens.error(res);
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
                    data: $.param({populate: ['contactInformation']}),
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
            var privileges = new DataTypePrivileges.List();
            var operator = new Operator.List();
            var dataTypes = new DataType.List();
            var biobanks = new Biobank.List();
            var that = this;
            var idProject = xtens.session.get('activeProject') !== 'all' ? _.find(xtens.session.get('projects'),function (p) { return p.name === xtens.session.get('activeProject'); }).id : undefined;
            var criteria = {
                populate:['children'],
                sort: 'id ASC'
            };
            idProject ? criteria.project = idProject : null;
            var $operatorDeferred = operator.fetch({
                data: $.param({login: xtens.session.get("login"), populate: ['groups']})
            });
            $.when($operatorDeferred).then( function(operatorRes) {
                var groupId = operatorRes && operatorRes[0].groups[0].id;
                var $privilegesDeferred = privileges.fetch({
                    data: $.param({group: groupId, limit:100})
                });
                var $dataTypesDeferred = dataTypes.fetch({ data: $.param(criteria) });
                var $biobanksDeferred = biobanks.fetch();
                $.when($dataTypesDeferred, $biobanksDeferred, $privilegesDeferred).then( function(dataTypesRes, biobanksRes, privilegesRes) {
                    that.loadView(new Query.Views.Builder({
                        queryObj: params && params.queryArgs,
                        biobanks: new Biobank.List(biobanksRes && biobanksRes[0]),
                        dataTypes: new DataType.List(dataTypesRes && dataTypesRes[0]),
                        dataTypePrivileges: new DataTypePrivileges.List(privilegesRes && privilegesRes[0])
                    }));
                }, function(jqxhr) {
                    xtens.error(jqxhr);
                });
            });
        },

        /**
         * @method
         * @name dedicatedDataUpload
         * @description loads the view to upload data that is automatically extracted on the server-side
         */
        dedicatedDataManagement: function() {
            this.loadView(new Data.Views.DedicatedManagement());
        }

    });

    xtens.router = new XtensRouter();


} (xtens));
