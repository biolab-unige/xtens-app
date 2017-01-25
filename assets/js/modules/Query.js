(function(xtens, Query) {
    // io.sails.autoConnect = false;
    var i18n = xtens.module("i18n").en;

    // TODO: retrieve this info FROM DATABASE ideally or from the server-side anyway
    var useFormattedNames = xtens.module("xtensconstants").useFormattedMetadataFieldNames;
    var Constants = xtens.module("xtensconstants").Constants;
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;
    var QueryStrategy = xtens.module("querystrategy");
    var Data = xtens.module("data");
    var DataType = xtens.module("datatype");
    var DataTypeClasses = xtens.module("xtensconstants").DataTypeClasses;
    var sexOptions = xtens.module("xtensconstants").SexOptions;
    var XtensTable = xtens.module("xtenstable");
    var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;
    var Privileges = xtens.module("xtensconstants").DataTypePrivilegeLevels;
    var VIEW_OVERVIEW = Privileges.VIEW_OVERVIEW;
    // constant to define the field-value HTML element
    var FIELD_VALUE = 'field-value';

    var checkboxTemplate = _.template("<div class='checkbox'><input type='checkbox'></div>");

    // Factory method class to create specialized query views
    function QueryViewFactory() {
        this.createModelQueryView = function(dataTypeModel, specializedFieldsObj) {
            switch(dataTypeModel) {
                case DataTypeClasses.SUBJECT:
                    return new Query.Views.Subject({ model: new Query.SubjectModel(specializedFieldsObj) });
                case DataTypeClasses.SAMPLE:
                    return new Query.Views.Sample({ model: new Query.SampleModel(specializedFieldsObj) , biobanks: arguments[2]});
            }
        };
    }

    var factory = new QueryViewFactory();

    Query.Model = Backbone.Model.extend({
        urlRoot: 'query'
    });

    // TODO: refactor this class together with MetadataComponent class
    /**
     * @class
     * @name Query.Views.Component
     * @extends Backbone.View
     * @description the abstract class for a generic query view component
     */
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

    /**
     * @class
     * @name Query.RowModel
     * @extends Backbone.Model
     * @description the Backbone model for a leaf element in the query builder
     *              Each leaf element contains the following attributes
     *              - fieldName - [string]
     *              - fieldType - [allowed options: TEXT/INTEGER/FLOAT/DATE/BOOLEAN]
     *              - comparator - [one of the allowed comparators]
     *              - junctor - [allowed options: AND(default)/OR]
     *              - fieldValue - one or more values to feed the query
     */
    Query.RowModel = Backbone.Model.extend({});

    Query.LoopModel = Backbone.Model.extend({});

    /**
     * @class
     * @name Query.Views.Row
     * @extends Backbone.View
     * @extends Query.Views.Component
     * @description a row element in the query builder interface. Each row represents a metadata field that is not within a loop
     *              each row contains the elements bound to the attributes of Query.RowModel
     */
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
                            // pick up formatted or unformatted name
                            var fieldName = useFormattedNames ? field.formattedName : field.name;
                            return {value: fieldName, label: field.name};
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
            // unset all the attributes but field name for the current model (FIX issue #1)
            _.forEach(model.attributes, function(value, key) {
                if (key !== 'fieldName') {
                    model.unset(key);
                }
            });

            this.generateStatementOptions(model, fieldName);
        },

        generateStatementOptions: function(model, fieldName) {
            this.$("input[type=hidden]").select2('destroy');

            // set match criteria on formatted or unformatted names depending of the application usage
            var matchCriteria = useFormattedNames ? {"formattedName": fieldName} : {"name": fieldName};

            var selectedField = _.findWhere(this.fieldList, matchCriteria);
            this.model.set("fieldType", selectedField.fieldType.toLowerCase());
            this.model.set("isList", selectedField.isList);
            this.model.set("caseInsensitive", selectedField.caseInsensitive);
            this.model.set("isInLoop", selectedField._loop);
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
                if (metadataField._loop) {
                    data = [{id: '?&', text: 'MATCH ALL'}, {id: '?|', text: 'MATCH ANY'}];
                }
                else {
                    data = [{ id: 'IN', text: '=' }, { id: 'NOT IN', text: '≠' }];
                }
            }
            else if (fieldType === FieldTypes.INTEGER || fieldType === FieldTypes.FLOAT) {
                data = [{ id: '=', text: '=' }, { id: '<=', text: '≤' },
                    { id: '>=', text: '≥' }, { id: '<', text: '<' },
                    { id: '>', text: '>' }, { id: '<>', text: '≠' }];
            }
            else if (fieldType === FieldTypes.TEXT) {
                data = [{ id: '=', text: '=' }, { id: '<>', text: '≠' },
                        { id: 'LIKE', text: 'LIKE'}, {id: 'NOT LIKE', text: 'NOT LIKE'},
                        { id: 'ILIKE', text: 'ILIKE'}, {id: 'NOT ILIKE', text: 'NOT ILIKE'}];
            }
            else {
                data = [{ id: '=', text: '=' }, { id: '<>', text: '≠' }];
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
     * @name Query.Views.PersonalInfo
     * @extends Backbone.View
     * @extends Query.Views.Component
     * @description a leaf element for the query builder, containing all the specialized parameters pertaining to PersonalInfo
     *              (i.e. givenName, surname, birthDate)
     */
    Query.Views.PersonalInfo = Query.Views.Component.fullExtend({

        className: 'query-personalinfo',

        bindings: {

            '[name="surname-comparator"]': {
                observe: 'surnameComparator',
                initialize: function($el) {
                    $el.select2({
<<<<<<< HEAD
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' },
                                { id: 'LIKE', text: 'LIKE'}, { id: 'NOT LIKE', text: 'NOT LIKE'}]
=======
                        data: [ { id: 'LIKE', text: '=' }, { id: 'NOT LIKE', text: '≠' }]
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
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
<<<<<<< HEAD
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' },
                                { id: 'LIKE', text: 'LIKE'}, { id: 'NOT LIKE', text: 'NOT LIKE'}]
=======
                        data: [ { id: 'LIKE', text: '=' }, { id: 'NOT LIKE', text: '≠' }]
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
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
<<<<<<< HEAD
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' },
                                { id: '<=', text: '≤' }, { id: '>=', text: '≥' },
                                { id: '<', text: '<'}, {id: '>', text: '>'}]
=======
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' }]
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
                    });
                }
            },
            '[name="birth-date"]': {
                observe: 'birthDate'
            }

        },

        events: {
            'input [name="surname"]': 'upper',
            'input [name="given-name"]': 'upper'
        },

        initialize: function(options) {
            this.template = JST['views/templates/query-personalinfo-fields.ejs'];
        },

        render: function() {
            this.$el.html(this.template({ __: i18n})); // TODO implement canViewPersonalInfo policy (server side)
            // this.$el.addClass("query-row");
            this.stickit();
            return this;
        },

        upper: function(ev) {
            ev.target.value = ev.target.value.toUpperCase();
        }

    });


    /**
     * @name Query.Views.Subject
     * @extends Backbone.View
     * @extends Query.Views.Component
     * @description a leaf element for the query builder, containing all the specialized parameters pertaining to Subject (i.e. code, sex)
     */
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


    /**
     * @name Query.Views.Sample
     * @extends Backbone.View
     * @extends Query.Views.Component
     * @description a leaf element for the query builder, containing all the specialized parameters pertaining to Sample (i.e. biobank code)
     */
    Query.Views.Sample = Query.Views.Component.fullExtend({

        className: 'query-sample',

        bindings: {
            '[name="biobank-comparator"]': {
                observe: 'biobankComparator',
                initialize: function($el) {
                    $el.select2({
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' }]
                    });
                }
            },

            '[name="biobank"]': {
                observe: 'biobank',
                initialize: function($el) {
                    $el.select2({placeholder: i18n('please-select')});
                },
                selectOptions: {
                    collection: function() {
                        return this.biobanks.map(function(biobank) {
                            return {
                                label: biobank.get("acronym"),
                                value: biobank.id
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
                },
                onGet: function(val) {
                    return val;
                }
            },

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
            this.biobanks = options.biobanks;
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


    /**
     * @deprecated
     * @class
     * @name Query.Views.Loop
     * @extends Backbone.View
     * @extends Query.Views.Component
     * @description another possible leaf of the query builder, this one (instead of Query.Views.Rows) describes metadata fields contained within a loop
     *
     *
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
    }); */

    /**
     * @class
     * @name Query.Views.Composite
     * @extends Backbone.View
     * @extends Query.Views.Component
     * @description the composite query view, containing various (nested) leaves (i.e. Query.Views.Rows)
     *
     */
    Query.Views.Composite = Query.Views.Component.fullExtend({

        className: 'query-composite',

        bindings: {
            '[name="pivot-data-type"]': {
                observe: 'dataType',
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
                },
                onGet: function(val) {
                    return val;
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
            this.biobanks = options.biobanks || [];
            this.dataTypes = options.dataTypes || [];
            this.dataTypesComplete = options.dataTypesComplete || [];
            this.dataTypePrivileges = options.dataTypePrivileges || [];
            // this.listenTo(this.model, 'change:dataType', this.dataTypeOnChange);
        },

        events: {
            'click [name="add-field"]': 'addQueryRow',
            // 'click [name="add-loop"]': 'addLoopQuery',
            'click [name="add-nested"]': 'nestedQueryBtnOnClick'
        },

        addQueryRow: function(ev) {
            ev.stopPropagation();
            var childView = new Query.Views.Row({fieldList: this.dataTypes.get(this.model.get('dataType')).getFlattenedFields(),
                                                model: new Query.RowModel()});
            this.$el.append(childView.render().el);
            this.add(childView);
        },

        /**
         * @deprecated
        addLoopQuery: function(ev) {
            ev.stopPropagation();
            var childView = new Query.Views.Loop({loopList: this.dataTypes.get(this.model.get('dataType')).getLoops(),
                                                 model: new Query.LoopModel()});
                                                 this.$el.append(childView.render().el);
                                                 this.add(childView);
        }, */

        nestedQueryBtnOnClick: function(ev) {
            ev.stopPropagation();
            this.addNestedQuery();
        },

        /**
         * @method
         * @name addNestedQuery
         * @description add a nested query element to the current composite view
         *
         */
        addNestedQuery: function(queryObj) {
            var childrenIds = _.pluck(this.selectedDataType.get("children"), 'id');
            var childrenDataTypes = new DataType.List(_.filter(this.dataTypesComplete.models, function(dataType) {
                return childrenIds.indexOf(dataType.id) > -1;
            }));
            if (!childrenDataTypes.length) return;

            // create composite subview
            var childView = new Query.Views.Composite({
                biobanks: this.biobanks,
                dataTypes: childrenDataTypes,
                dataTypesComplete: this.dataTypesComplete,
<<<<<<< HEAD
                dataTypePrivileges:this.dataTypePrivileges,

=======
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
                model: new Query.Model(queryObj)
            });

            this.$el.append(childView.render({}).el);
            this.add(childView);
        },

        /**
         * @method
         * @name dataTypeOnChange
         * @param{DataType.Model} model - the Backbone current model, not used in the function
         * @param{integer} idDataType - the ID of the selected Data Type
         */
        dataTypeOnChange: function(model, idDataType) {
            this.clear();
            if (!idDataType) {
                this.$addFieldButton.addClass('hidden');
                this.$addLoopButton.addClass('hidden');
                this.$addNestedButton.removeClass('hidden');
                this.selectedDataType = null;
                this.model.set("model", null);
                return;
            }
            this.createDataTypeRow(idDataType);
        },

        /**
         * @method
         * @name createDataTypeRow
         * @param{integer} idDataType
         */
        createDataTypeRow: function(idDataType) {
            var personalInfoQueryView, modelQueryView, childView, queryContent = this.model.get("content");
            this.selectedDataType = this.dataTypes.get(idDataType);
            this.selectedPrivilege = this.dataTypePrivileges.findWhere({'dataType' : idDataType});
            this.model.set("model", this.selectedDataType.get("model"));
<<<<<<< HEAD
            if (this.model.get("model") === DataTypeClasses.SUBJECT && xtens.session.get('canAccessPersonalData')) {
=======
            if (this.model.get("model") === DataTypeClasses.SUBJECT) {      //TODO add policy to filter those not allowed to see personal info
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
                personalInfoQueryView = new Query.Views.PersonalInfo({
                    model: new Query.PersonalInfoModel(_.findWhere(queryContent, {personalDetails: true}))
                });
                this.addSubqueryView(personalInfoQueryView);
            }
            var specializedFieldsArr =  _.where(queryContent, {specializedQuery: this.model.get("model")});
            // compress al the elements in the specialized query in a single object
            var specializedFieldsObj = _.reduce(specializedFieldsArr, function(obj, elem) {
                return _.merge(obj, elem);
            }, {});
            modelQueryView = factory.createModelQueryView(this.model.get("model"), specializedFieldsObj, this.biobanks);
            if (modelQueryView) {
                this.addSubqueryView(modelQueryView);
            }
            if (this.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW) {
                this.$addFieldButton.removeClass('hidden');
            }
            this.$addNestedButton.removeClass('hidden');

            var flattenedFields = this.selectedDataType.getFlattenedFields();
            if (!xtens.session.get('canAccessSensitiveData') && this.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW){
                flattenedFields = _.filter(flattenedFields, function(field) { return !field.sensitive; });
            }

            // this.model.set("model", this.selectedDataType.get("model"));
            // queryContent = this.model.get("content");
            if (_.isArray(queryContent) && queryContent.length > 0) {
                _.each(queryContent, function(queryElem) {
                    // it is a nested a nested composite element
                    if (queryElem.specializedQuery || queryElem.personalDetails) {
                        return true;  // continue to next iteration
                    }
                    else if (queryElem.dataType) {
                        this.addNestedQuery(queryElem);
                    }
                    // it is a leaf query element
                    else {
<<<<<<< HEAD
                        if (this.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW) {
                            childView = new Query.Views.Row({
                                fieldList: flattenedFields,
                                model: new Query.RowModel(queryElem)
                            });
                            this.addSubqueryView(childView);
                        }
=======
                        childView = new Query.Views.Row({
                            fieldList: this.selectedDataType.getFlattenedFields(),
                            model: new Query.RowModel(queryElem)
                        });
                        this.addSubqueryView(childView);
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
                    }
                }, this);
            }
            else {
                if (this.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW) {
                    childView = new Query.Views.Row({fieldList: flattenedFields, model: new Query.RowModel()});
                    this.$el.append(childView.render().el);
                    this.add(childView);
                }
            }
        },


        /**
         * @method
         * @name addSubqueryView
         * @description add a subquery view to the composite view
         * @param{Query.View.Component} subqueryView
         */
        addSubqueryView: function(subqueryView) {
            this.$el.append(subqueryView.render().el);
            this.add(subqueryView);
        },

        /**
         * @method
         * @name clear
         * @description removes all the nested subviews, if present
         */
        clear: function() {
            var len = this.nestedViews.length;
            for(var i=len-1; i>=0; i--) {
                this.removeChild(this.nestedViews[i]);
            }
            // this.model.clear(); // clear your model
        },

        /**
         * @method
         * @name render
         * @extends Backbone.View.render
         */
        render: function(options) {
            if (options.id) {} // load an existing query TODO
            else {
                this.$el.html(this.template({__: i18n }));
                this.stickit();
            }
            this.$addFieldButton = this.$("[name='add-field']");
            this.$addLoopButton = this.$("[name='add-loop']");
            this.$addNestedButton = this.$("[name='add-nested']");
            if (this.model.get("dataType")) {
                this.createDataTypeRow(this.model.get("dataType"));
            }
            this.listenTo(this.model, 'change:dataType', this.dataTypeOnChange);
            return this;
        }

    });

    /**
     * @class
     * @name Query.Views.Builder
     * @extends Backbone.View
     * @description the main container for the query builder form
     *
     */
    Query.Views.Builder = Backbone.View.extend({
        events : {
            'click #search': 'sendQuery'
        },


        className: 'query',

        /**
         * @method
         * @name initialize
         * @extends Backbone.View.initialize
         * @param{Object} - options, which contains the following properties:
         *                  - dataTypes - a list/array of available DataTypes
         *                  - queryObj - a (possibly nested) query object, as the one sent to server side requests
         */
        initialize: function(options) {
            _.bindAll(this, ['initializeDataTable', 'queryOnError']);
            this.template = JST["views/templates/query-builder.ejs"];
            $('#main').html(this.el);
            this.biobanks = options.biobanks || [];
            this.dataTypes = options.dataTypes || [];
            this.dataTypePrivileges = options.dataTypePrivileges || [];
            this.render(options);
            this.queryView = new Query.Views.Composite({
                biobanks: this.biobanks,
                dataTypes: this.dataTypes,
                dataTypesComplete: this.dataTypes,
<<<<<<< HEAD
                dataTypePrivileges: this.dataTypePrivileges,
=======
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
                model: new Query.Model(options.queryObj)
            });
            this.$tableCnt = this.$("#result-table-cnt");
            this.$queryModal = this.$(".query-modal");
            this.$queryNoResultCnt = this.$("#queryNoResultCnt");
            this.$queryErrorCnt = this.$("#queryErrorCnt");
            this.tableView = null;
            this.$("#query-form").append(this.queryView.render({}).el);
            this.listenToOnce(this, 'search', this.sendQuery);
            // if a query object exists trigger a server-side search
            if (options.queryObj) {
                this.trigger('search');
            }
        },

        render: function() {
            this.$el.html(this.template({__: i18n }));
            return this;
        },

<<<<<<< HEAD
=======
        events : {
            'click #search': 'sendQuery',
        },
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78

        /**
         * @method
         * @name sendQuery
         * @description compose the object with query parameters and send it through AJAX request to the server for executing a (sanitised) query
         * @return{boolean} false
         */
        sendQuery: function() {
            var that = this;
            var isStream = xtens.infoBrowser[0] === "Chrome" && xtens.infoBrowser[1] >= 54 ? true : false;
            // extend queryArgs with flags to retrieve subject and personal informations and if retrieve data in stream mode
            var queryArgs = _.extend({
                wantsSubject: true,
                wantsPersonalInfo: xtens.session.get('canAccessPersonalData')
            }, this.queryView.serialize());

            var queryParameters = JSON.stringify({queryArgs: queryArgs});
            console.log(this.queryView.serialize());
            var path = '/query/' + encodeURIComponent(queryParameters);
            xtens.router.navigate(path, {trigger: false});
<<<<<<< HEAD
            if (isStream) {
                fetch('/query/dataSearch',{
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + xtens.session.get("accessToken"),
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: 'queryArgs='+JSON.stringify(queryArgs)+'&isStream='+JSON.stringify(isStream)
                })
              .then(function(res) {
                  that.buffer = [], that.optStream = {}, that.tableInitialized = false;
                  return that.pumpStream(res.body.getReader());
              })
              .catch(function(ex) {
                  console.log('parsing failed', ex);
                  that.queryOnError();
              });
            }
            else {

                $.ajax({
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                    },
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    url: '/query/dataSearch',
                    data: 'queryArgs='+JSON.stringify(queryArgs)+'&isStream='+JSON.stringify(isStream),
                    success: this.initializeDataTable,
                    error: this.queryOnError
                });
            }

=======
            $.ajax({
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                contentType: 'application/json;charset:utf-8',
                url: '/query/dataSearch',
                data: queryParameters,
                success: this.queryOnSuccess,
                error: this.queryOnError
            });
>>>>>>> 1ee1f683ba84d9e10b05b1d00c62498c0bc46f78
            this.modal = new ModalDialog({
                title: i18n('please-wait-for-query-to-complete'),
                body: JST["views/templates/progressbar.ejs"]({valuemin: 0, valuemax: 100, valuenow: 100})
            });
            this.$queryModal.append(this.modal.render().el);
            this.modal.show();
            return false;
        },

        /**
         * @method
         * @name pumpStream
         * @description Receive and decode json stream and initialize dataTable
         * @param{Readable Stream}
           @return{function} recursivly itself until stream end
         */
        pumpStream: function(reader) {
            var that = this;
            return reader.read().then(function (result) {

                //if stream end and table is initialized
                if (result.done && that.tableInitialized) {
                  //if more data to be rendered
                    if(that.buffer.length !== 0){
                        that.tableView.addRowDataTable(that.buffer);
                    }
                    that.buffer = [];
                    return reader.cancel();
                }

                var chunk = result.value;
                var decoded = new TextDecoder().decode(chunk);
                decoded = decoded.split(/\r?\n/);

                //If temp exist, it was found a corrupted json in previous cycle
                //It must be concatenated with next decoded data and then parsed again
                if (that.temp){
                    decoded[0] = that.temp.concat(decoded[0]);
                    that.temp = "";
                }
              //each data string must be parsed and pushed in the buffer
                decoded.forEach(function(data){
                  //try to parse data string if pass
                  //object is pushed in buffer or in options object if it is dataType or dataPrivilege obj
                    try {
                        var parsed = JSON.parse(data);
                        parsed.dataType ? that.optStream.dataType = parsed.dataType :
                            parsed.dataPrivilege ? that.optStream.dataPrivilege = parsed.dataPrivilege :
                            parsed.error ? that.optStream.error = parsed.error :
                            that.buffer.push(parsed);
                    }
                    catch (e) {
                        that.temp = data;
                    }
                    finally{
                        parsed = null;
                    }
                });

                if(that.optStream.error){
                    that.queryOnError(that.optStream.error);
                    return reader.cancel();
                }

                if(!that.tableInitialized && ((that.optStream.dataType && that.optStream.dataPrivilege && that.buffer.length >= 8000) || (result.done && that.buffer.length >= 0))) {
                    var jsonParsed = {data:[]};
                    jsonParsed.dataType = that.optStream.dataType;
                    jsonParsed.dataTypePrivilege = that.optStream.dataPrivilege;
                    jsonParsed.data = that.buffer;
                    that.tableInitialized = true;
                    that.buffer = [];
                    that.initializeDataTable(jsonParsed);
                }

                return that.pumpStream(reader);

            });
        },

        /**
         * @method
         * @name initializeDataTable
         */
        initializeDataTable: function(result) {

            if (this.tableView) {
                this.tableView.destroy();
            }
            this.hideProgressbar();
            if (!result) this.queryOnError(null, null, "Missing result object");

            if (_.isEmpty(result.data)) {
                this.$queryNoResultCnt.show();
                /*
                this.modal = new ModalDialog({
                    title: i18n('no-result-found'),
                    body: i18n("no-data-was-found-to-match-your-search-options") + ' ' + i18n('please-try-again-with-different-parameters')
                });
                this.$queryModal.append(this.modal.render().el);
                this.modal.show(); */
                return;
            }

            this.tableView = new XtensTable.Views.DataTable(result);
            this.$tableCnt.append(this.tableView.render().el);
            this.tableView.displayDataTable();
        },

        /**
         * @method
         * @name queryOnError
         * @description
         */
        queryOnError: function(jqXHR, textStatus, err) {
            this.$(".query-hidden").hide();
            this.modal && this.modal.hide();
            if (this.tableView) {
                this.tableView.destroy();
            }
            this.$queryErrorCnt.show();
        },

        /**
         * @method
         * @name hideProgressbar
         * @description
         */
        hideProgressbar: function() {
            this.$(".query-hidden").hide();
            this.modal && this.modal.hide();
        }

    });

} (xtens, xtens.module("query")));
