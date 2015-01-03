(function(xtens, Query) {

    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants; 
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;
    var QueryStrategy = xtens.module("querystrategy");
    var Data = xtens.module("data");
    var DataType = xtens.module("datatype");
    var DataTypeClasses = xtens.module("xtensconstants").DataTypeClasses;
    var sexOptions = xtens.module("xtensconstants").SexOptions;
    var XtensTable = xtens.module("xtenstable");
    var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;

    // constant to define the field-value HTML element
    var FIELD_VALUE = 'field-value';

    var checkboxTemplate = _.template("<div class='checkbox'><input type='checkbox'></div>");

    // Factory method class to create specialized query views
    function QueryViewFactory() {
        this.createClassTemplateQueryView = function(classTemplate) {
            switch(classTemplate) {
                case DataTypeClasses.SUBJECT:
                    return new Query.Views.Subject({ model: new Query.SubjectModel() });
                case DataTypeClasses.SAMPLE:
                    return new Query.Views.Sample({ model: new Query.SampleModel() });
            }
        };
    }

    var factory = new QueryViewFactory();

    Query.Model = Backbone.Model.extend({
        urlRoot: 'query'
    });

    // TODO: refactor this class together with MetadataComponent class
    Query.Views.Component = Backbone.View.extend({

        add: function(child) {
            this.nestedViews.push(child);
        },

        removeChild: function(child) {
            for (var i=0, len = this.nestedViews.length; i<len; i++) {
                if (_.isEqual(this.nestedViews[i], child)) {
                    child.remove();
                    if (child.nestedViews) {
                        for (var j=0, clen=child.nestedViews.length; j<clen; j++) {
                            if (child.nestedViews[j].remove) {
                                child.nestedViews[j].remove();
                            }
                        }
                    }
                    this.nestedViews.splice(i, 1);
                }
            }
        },

        getChild: function(i) {
            if (this.nestedViews) {
                return this.nestedViews[i];
            }
            return null;
        },

        closeMe: function(ev) {
            this.trigger('closeMe', this);
        },

        serialize: function() {
            var res = _.clone(this.model.attributes);
            if (_.isArray(this.nestedViews)) {
                res.content = [];
                for (var i=0, len=this.nestedViews.length; i<len; i++) {
                    res.content.push(this.nestedViews[i].serialize());
                }
                res.content = _.flatten(res.content, true);
            }
            return res;
        }

    });

    Query.PersonalInfoModel = Backbone.Model.extend({
        defaults: {
            "personalDetails":  true   
        }
    });

    Query.SubjectModel = Backbone.Model.extend({
        defaults: {
            "specializedQuery": DataTypeClasses.SUBJECT
        }
    });

    Query.SampleModel = Backbone.Model.extend({
        defaults: {
            "specializedQuery": DataTypeClasses.SAMPLE
        }
    });

    Query.RowModel = Backbone.Model.extend({});

    Query.LoopModel = Backbone.Model.extend({});

    Query.Views.Row = Query.Views.Component.fullExtend({

        className: 'form-group',

        bindings: {
            '[name="field-name"]': {
                observe: 'fieldName',
                initialize: function($el) {
                    $el.select2({placeholder: i18n("please-select")});
                },
                selectOptions: { 
                    collection: function() {
                    return this.fieldList.map(function(field) {
                        return {value: field.name, label: replaceUnderscoreAndCapitalize(field.name)};
                    });
                },
                defaultOption: {
                    label: "",
                    value: null
                }
                }

            }
        },

        initialize: function(options) {
            this.template = JST['views/templates/query-generic-row.ejs'];
            this.fieldList = options.fieldList;
            this.listenTo(this.model, 'change:fieldName', this.fieldNameOnChange);
        },

        render: function() {
            this.$el.html(this.template({ __: i18n}));
            this.$el.addClass("query-row");
            this.stickit();
            this.$comparator = this.$("input[name=comparator]");
            this.$unit = this.$("input[name=unit]");
            this.$junction = this.$("input[name=junction]");
            if (this.model.get("fieldName")) {
                this.generateStatementOptions(this.model, this.model.get("fieldName"));
            }
            return this;
        },

        fieldNameOnChange: function(model, fieldName) {
            this.generateStatementOptions(model, fieldName);
        },

        generateStatementOptions: function(model, fieldName) {
            this.$("input[type=hidden]").select2('destroy');
            var selectedField = _.findWhere(this.fieldList, {name: fieldName});
            this.model.set("fieldType", selectedField.fieldType.toLowerCase());
            this.model.set("isList", selectedField.isList);
            this.generateComparisonItem(selectedField);
            this.generateComparedValueItem(selectedField);
            if (selectedField.hasUnit && selectedField.possibleUnits) {
                this.generateComparedUnitItem(selectedField.possibleUnits);
            }
            this.generateJunctionItem();
        },

        generateComparisonItem: function(metadataField) {
            var data = [], fieldType = metadataField.fieldType;
            if (fieldType === FieldTypes.BOOLEAN) {
                data = [{id: '=', text: '='}];
            }
            else if (metadataField.isList) {
                data = [ { id: 'IN', text: '=' }, { id: 'NOT IN', text: '≠' }];
            }
            else if (fieldType === FieldTypes.INTEGER || fieldType === FieldTypes.FLOAT) {
                data = [ { id: '=', text: '=' }, { id: '<=', text: '≤' },
                    { id: '>=', text: '≥' }, { id: '<', text: '<' },
                    { id: '>', text: '>' }, { id: '<>', text: '≠' }];
            }
            else if (fieldType === FieldTypes.TEXT) {
                data = [ { id: 'LIKE', text: '=' }, { id: 'NOT LIKE', text: '≠' }];
            }
            else {
                data = [ { id: '=', text: '=' }, { id: '<>', text: '≠' }];
            }
            this.addBinding(null, 'input[name=comparator]', {
                observe: 'comparator',
                initialize: function($el) {
                    $el.select2({
                        data: data 
                    });
                }
            });
        },

        generateComparedValueItem: function(metadataField) {
            var data = [], fieldType = metadataField.fieldType;
            if (fieldType === FieldTypes.BOOLEAN) {
                this.appendComparedBoolean();
            }
            else if (metadataField.isList) {
                this.appendComparedValueList(metadataField.possibleValues);
            }
            else {
                this.appendTextInput();
            }
        },

        appendComparedBoolean: function() {
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("query-value-div");
            var selector = document.createElement("input");
            selector.type = 'hidden';
            selector.className = 'form-control';
            selector.name = FIELD_VALUE;
            $container.append(selector);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", { 
                observe: 'fieldValue',
                initialize: function($el) {
                    $el.select2({
                        data: [{id: true, text: i18n('yes')}, {id: false, text: i18n('no')}]
                    });
                }
            });
        },

        appendComparedValueList: function(list) {
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("query-value-div");
            var selector = document.createElement("input");
            selector.type = 'hidden';
            selector.name = FIELD_VALUE;
            selector.className = 'form-control';
            var data = list.map(function(elem) { return {"id":elem, "text":elem}; });
            $container.append(selector);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", { 
                observe: 'fieldValue',
                initialize: function($el) {
                    $el.select2({
                        multiple: true,
                        data: data, 
                        placeholder: i18n("please-select")});
                },
                getVal: function($el) {
                    return $el.val().split(",");
                }

            });
        },

        appendTextInput: function(validationOpts) {
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("query-value-div");
            var textField = document.createElement("input");
            textField.type = 'text';
            textField.name = FIELD_VALUE;
            textField.className = 'form-control';
            $container.append(textField);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", {
                observe: 'fieldValue'
            });
        },

        generateComparedUnitItem:function(possibleUnits) {
            var data = possibleUnits.map(function(unit) {
                return { id: unit, text: unit };
            });
            this.addBinding(null, "input[name='unit']", { 
                observe: 'fieldUnit',
                initialize: function($el) {
                    $el.select2({
                        data: data, 
                        placeholder: i18n("please-select")});
                }  
            });
        },

        generateJunctionItem: function() {
            var data = [ {id: 'AND', text: 'AND'}, {id: 'OR', text: 'OR'} ];
            this.$junction.select2({
                data: data
            });
        }


    });

    /**
     * @description subview to query PersonalInfo/Personal Details fields 
     */

    Query.Views.PersonalInfo = Query.Views.Component.fullExtend({

        className: 'query-personalinfo',

        bindings: {

            '[name="surname-comparator"]': {
                observe: 'surnameComparator',
                initialize: function($el) {
                    $el.select2({
                        data: [ { id: 'LIKE', text: '=' }, { id: 'NOT LIKE', text: '≠' }] 
                    });
                }
            },
            '[name="surname"]': {
                observe: 'surname'
            },
            '[name="given-name-comparator"]': {
                observe: 'givenNameComparator',
                initialize: function($el) {
                    $el.select2({
                        data: [ { id: 'LIKE', text: '=' }, { id: 'NOT LIKE', text: '≠' }] 
                    });
                }
            },
            '[name="given-name"]': {
                observe: 'givenName'
            },
            '[name="birth-date-comparator"]': {
                observe: 'birthDateComparator',
                initialize: function($el) {
                    $el.select2({
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' }] 
                    });
                }
            },
            '[name="birth-date"]': {
                observe: 'birthDate'
            }

        },

        initialize: function(options) {
            this.template = JST['views/templates/query-personalinfo-fields.ejs'];
        },

        render: function() {
            this.$el.html(this.template({ __: i18n})); // TODO implement canViewPersonalInfo policy (server side)
            // this.$el.addClass("query-row");
            this.stickit();
            return this;
        }

    });

    Query.Views.Subject = Query.Views.Component.fullExtend({

        className: 'query-subject',

        bindings: {
            '[name="code-comparator"]': {
                observe: 'codeComparator',
                initialize: function($el) {
                    $el.select2({
                        data: [ { id: 'LIKE', text: '=' }, { id: 'NOT LIKE', text: '≠' }] 
                    });
                }
            },
            '[name="code"]': {
                observe: 'code'
            },
            '[name="sex-comparator"]': {
                observe: 'sexComparator',
                initialize: function($el) {
                    $el.select2({
                        data: [ { id: 'IN', text: '=' }, { id: 'NOT IN', text: '≠' }]
                    });
                }
            },
            '[name="sex"]': {
                observe: 'sex',
                initialize: function($el) {
                    var data = []; 
                    _.each(sexOptions, function(sexOption) {
                        data.push({id: sexOption, text: sexOption});
                    });
                    $el.select2({
                        multiple: true,
                        placeholder: i18n("please-select"),
                        data: data
                    });
                },
                getVal: function($el) {
                    return $el.val().split(",");
                }
            }
        },

        initialize: function(options) {
            this.template = JST['views/templates/query-subject-fields.ejs'];
        },

        render: function() {
            this.$el.html(this.template({ __: i18n })); // TODO implement canViewPersonalInfo policy (server side)
            // this.$el.addClass("query-row");
            this.stickit();
            return this;
        },

        serialize: function() {
            var serialized = [];
            _.each(Constants.SUBJECT_PROPERTIES, function(property) {
                serialized.push(_.pick(_.clone(this.model.attributes), [property, property+'Comparator', 'specializedQuery']));
            }, this);
            return serialized;
        }
    });

    Query.Views.Sample = Query.Views.Component.fullExtend({
        
        className: 'query-sample',

        bindings: {
            '[name="biobank-code-comparator"]': {
                observe: 'biobankCodeComparator',
                initialize: function($el) {
                    $el.select2({
                        data: [ { id: 'LIKE', text: '=' }, { id: 'NOT LIKE', text: '≠' }] 
                    });
                }
            },
            '[name="biobank-code"]': {
                observe: 'biobankCode'
            }
        },

        initialize: function(options) {
            this.template = JST['views/templates/query-sample-fields.ejs'];
        },

        render: function() {
            this.$el.html(this.template({ __: i18n }));             
            this.stickit();
            return this;
        },

        serialize: function() {
            var serialized = [];
            _.each(Constants.SAMPLE_PROPERTIES, function(property) {
                serialized.push(_.pick(_.clone(this.model.attributes), [property, property+'Comparator', 'specializedQuery']));
            }, this);
            return serialized;
        }

    });

    Query.Views.Loop = Query.Views.Component.fullExtend({

        className: 'query-loop',

        initialize: function(options) {
            this.template = JST['views/templates/query-builder-loop.ejs'];
            this.loopList = options.loopList;
            this.nestedViews = [];
            this.listenTo(this.model, 'change:loopName', this.loopNameOnChange);
        },

        render: function() {
            this.$el.html(this.template({ __: i18n}));
            this.stickit();
            this.$loopBody = this.$(".query-loop-body");
            return this;
        },

        bindings: {
            '[name="loop-name"]': {
                observe: 'loopName',
                initialize: function($el) {
                    $el.select2({placeholder: i18n("please-select")});
                },
                selectOptions: {
                    collection: 'this.loopList',
                    labelPath: 'name',
                    valuePath: 'name',
                    defaultOption: {
                        label: "",
                        value: null
                    }
                }

            }
        },

        loopNameOnChange: function() {
            var selectedLoop = _.findWhere(this.loopList, {name: this.model.get('loopName')});
            var childView;
            for (var i=0, len=selectedLoop.content.length; i<len; i++) {
                childView = new Query.Views.Row({fieldList: [selectedLoop.content[i]], 
                                                model: new Query.RowModel({fieldName: selectedLoop.content[i].name})});
                                                this.$loopBody.append(childView.render().el);
                                                this.add(childView);
            }
        }
    });

    Query.Views.Composite = Query.Views.Component.fullExtend({

        className: 'query-composite',

        bindings: {
            '[name="pivot-data-type"]': {
                observe: 'pivotDataType',
                initialize: function($el) {
                    $el.select2({placeholder: i18n('please-select')});
                },
                selectOptions: {
                    collection: function() {
                        return this.dataTypes.map(function(dataType) {
                            return {
                                label: dataType.get("name"),
                                value: dataType.id
                            };
                        });
                    },
                    defaultOption: {
                        label: "",
                        value: null
                    }
                },
                getVal: function($el, ev, options) {
                    return parseInt($el.val());
                }
            },
            '[name="junction"]': {
                observe: 'junction',
                initialize: function($el) {
                    $el.select2();
                },
                selectOptions: {
                    collection: function() {
                        return [{value:'AND', label:i18n("all-conditions")}, {value:'OR', label:i18n("any-of-the-conditions")}];
                    }
                }
            }

        },

        initialize: function(options) {
            this.template = JST["views/templates/query-composite.ejs"];
            this.nestedViews = [];
            this.dataTypes = options.dataTypes || [];
            this.dataTypesComplete = options.dataTypesComplete || [];
            // this.listenTo(this.model, 'change:pivotDataType', this.pivotDataTypeOnChange);
        },

        events: {
            'click [name="add-field"]': 'addQueryRow',
            'click [name="add-loop"]': 'addLoopQuery',
            'click [name="add-nested"]': 'addNestedQuery'
        },

        addQueryRow: function(ev) {
            ev.stopPropagation();
            var childView = new Query.Views.Row({fieldList: this.dataTypes.get(this.model.get('pivotDataType')).getFlattenedFields(),
                                                model: new Query.RowModel()});
                                                this.$el.append(childView.render().el);
                                                this.add(childView);
        },

        addLoopQuery: function(ev) {
            ev.stopPropagation();
            var childView = new Query.Views.Loop({loopList: this.dataTypes.get(this.model.get('pivotDataType')).getLoops(),
                                                 model: new Query.LoopModel()});
                                                 this.$el.append(childView.render().el);
                                                 this.add(childView);
        },

        addNestedQuery: function(ev) {
            ev.stopPropagation();
            var childrenIds = _.pluck(this.selectedDataType.get("children"), 'id');
            var childrenDataTypes = new DataType.List(_.filter(this.dataTypesComplete.models, function(dataType) {
                return childrenIds.indexOf(dataType.id) > -1;
            }));
            if (!childrenDataTypes.length) return;
            var childView = new Query.Views.Composite({dataTypes: childrenDataTypes, dataTypesComplete: this.dataTypesComplete, model: new Query.Model()});
            this.$el.append(childView.render({}).el);
            this.add(childView);
        },

        pivotDataTypeOnChange: function(model, idDataType) {
            this.clear();
            if (!idDataType) {
                this.$addFieldButton.addClass('hidden');
                this.$addLoopButton.addClass('hidden');
                this.$addNestedButton.removeClass('hidden');
                this.selectedDataType = null;
                this.model.set("classTemplate", null);
                return;
            }
            this.selectedDataType = this.dataTypes.get(idDataType);
            this.model.set("classTemplate", this.selectedDataType.get("classTemplate"));
            if (this.model.get("classTemplate") === DataTypeClasses.SUBJECT) {      //TODO add policy to filter those not allowed to see personal info 
                var personalInfoQueryView = new Query.Views.PersonalInfo({ model: new Query.PersonalInfoModel() });
                this.addSubqueryView(personalInfoQueryView);
            }
            var classTemplateQueryView = factory.createClassTemplateQueryView(this.model.get("classTemplate"));
            if (classTemplateQueryView) {
                this.addSubqueryView(classTemplateQueryView);
            }
            /*  // removed "improved loop search"
                if (selectedDataType.hasLoops()) {
                this.$addLoopButton.removeClass('hidden');
                } */
            this.$addFieldButton.removeClass('hidden');
            this.$addNestedButton.removeClass('hidden');
            var childView = new Query.Views.Row({fieldList: this.selectedDataType.getFlattenedFields(), model: new Query.RowModel()});
            this.$el.append(childView.render().el);
            // this.model.set("classTemplate", this.selectedDataType.get("classTemplate"));
            this.add(childView);

        },

        addSubqueryView: function(subqueryView) {
            this.$el.append(subqueryView.render().el);
            this.add(subqueryView);
        },

        clear: function() {
            var len = this.nestedViews.length; 
            for(var i=len-1; i>=0; i--) {
                this.removeChild(this.nestedViews[i]);
            }
        },

        render: function(options) {
            if (options.id) {} // load an existing query TODO
            else {
                this.$el.html(this.template({__: i18n }));
                this.stickit();
            }
            this.$addFieldButton = this.$("[name='add-field']");
            this.$addLoopButton = this.$("[name='add-loop']");
            this.$addNestedButton = this.$("[name='add-nested']");
            this.listenTo(this.model, 'change:pivotDataType', this.pivotDataTypeOnChange);
            return this;
        }

    });

    Query.Views.Builder = Backbone.View.extend({

        className: 'query',

        initialize: function(options) {
            _.bindAll(this, 'queryOnSuccess');
            this.template = JST["views/templates/query-builder.ejs"];
            $('#main').html(this.el);
            this.dataTypes = options.dataTypes || [];
            this.render(options);
            this.queryView = new Query.Views.Composite({dataTypes: this.dataTypes, dataTypesComplete: this.dataTypes, model: new Query.Model()});
            this.$tableCnt = this.$("#result-table");
            this.tableView = null;
            this.$("#query-form").append(this.queryView.render({}).el);
        },

        render: function() {
            this.$el.html(this.template({__: i18n }));
            return this;
        },

        events : {
            'click #search': 'sendQuery'
        },

        sendQuery: function() {
            var queryParameters = JSON.stringify({queryArgs: this.queryView.serialize()});
            console.log(this.queryView.serialize());
            $.ajax({
                method: 'POST',
                contentType: 'application/json;charset:utf-8',
                url: '/query/dataSearch',
                data: queryParameters,
                success: this.queryOnSuccess,
                error: function(jqXHR, textStatus, err) {
                    alert(err);
                }

            });
            return false;
        },

        queryOnSuccess: function(result) {
            if (this.tableView) {
                this.tableView.remove();
            }
            // this.tableView = new XtensTable.Views.HtmlTable({ data: data});
            this.tableView = new XtensTable.Views.DataTable(result);
            this.$tableCnt.append(this.tableView.render().el);
        }

    });

} (xtens, xtens.module("query")));
