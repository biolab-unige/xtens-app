(function(xtens, Query) {
    // io.sails.autoConnect = false;
    var i18n = xtens.module("i18n").en;

    // TODO: retrieve this info FROM DATABASE ideally or from the server-side anyway
    var useFormattedNames = xtens.module("xtensconstants").useFormattedMetadataFieldNames;
    var Constants = xtens.module("xtensconstants").Constants;
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;
    // var QueryStrategy = xtens.module("querystrategy");
    // var Data = xtens.module("data");
    var DataType = xtens.module("datatype");
    var SuperType = xtens.module("supertype");
    var DataTypeClasses = xtens.module("xtensconstants").DataTypeClasses;
    var sexOptions = xtens.module("xtensconstants").SexOptions;
    var XtensTable = xtens.module("xtenstable");
    // var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;
    var Privileges = xtens.module("xtensconstants").DataTypePrivilegeLevels;
    var VIEW_OVERVIEW = Privileges.VIEW_OVERVIEW;
    // constant to define the field-value HTML element
    var FIELD_VALUE = 'field-value';

    var parsleyOpts = {
        priorityEnabled: false,
        // excluded: "select[name='fieldUnit']",
        successClass: "has-success",
        errorClass: "has-error",
        classHandler: function(el) {
            return el.$element.parent();
        },
        errorsWrapper: "<span class='help-block'></span>",
        errorTemplate: "<span></span>"
    };

    // var checkboxTemplate = _.template("<div class='checkbox'><input type='checkbox'></div>");

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

        clearMe: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            this.clear(false);
        },

        serialize: function(leafSearch) {
            var res = _.clone(this.model.attributes);
            if (_.isArray(this.nestedViews)) {
                res.content = [];
                if (res.label) {
                    var leaf = {
                        label: res.label.replace(/[_]/g," ").replace(/(^|\s)\S/g, function(l){ return l.toUpperCase(); }),
                        getMetadata: res.getMetadata,
                        superType: res.superType
                    };
                    leafSearch.push(leaf);
                }
                for (var i=0, len=this.nestedViews.length; i<len; i++) {
                    var result = this.nestedViews[i].serialize(leafSearch);
                    var serialized = result.res;
                    if (!_.isEmpty(serialized) && (!serialized.content || (serialized.content && !_.isEmpty(serialized.content)))) {
                        if (!serialized.fieldName || serialized.fieldValue && serialized.comparator) {
                            res.content.push(serialized);
                        }
                    }
                }
                if(res.content && res.content.length > 0 && !_.isEmpty(res.content[0])){
                    res.content = _.flatten(res.content, true) ;
                }else {
                    delete res['content'];
                }
            }
            return {res:res, leafSearch: leafSearch };
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
                var selectedField = this.generateStatementOptions(this.model, this.model.get("fieldName"));
                this.$fieldValue = this.$("input[name='"+FIELD_VALUE+"']");
                this.setValidationOptions(selectedField);
                $("#query-form").parsley(parsleyOpts);
            }
            return this;
        },

        setValidationOptions: function(selectedField) {

            this.$fieldValue.prop('required', true);
            this.$comparator.prop('required', true);

            switch (selectedField.fieldType) {
                case FieldTypes.INTEGER:
                    this.$fieldValue.attr("data-parsley-type", "integer");
                    break;
                case FieldTypes.FLOAT:
                    this.$fieldValue.attr("data-parsley-type", "number");
                    break;
                case FieldTypes.DATE:
                    this.initDatepicker();
                    this.$fieldValue.attr("placeholder", "YYYY-MM-DD");
                    break;
            }
            if (selectedField.hasRange) {
                this.$fieldValue.attr("min", selectedField.min);
                this.$fieldValue.attr("max", selectedField.max);
            }
            if (selectedField.hasUnit && selectedField.possibleUnits) {
                this.$unit.prop('required', true);
            }
        },

        initDatepicker: function() {
            var picker = new Pikaday({
                field: this.$fieldValue[0],
                format: 'YYYY-MM-DD',
                yearRange: [1900, new Date().getYear()],
                maxDate: new Date()
            });
        },

        fieldNameOnChange: function(model, fieldName) {
            // unset all the attributes but field name for the current model (FIX issue #1)
            _.forEach(model.attributes, function(value, key) {
                if (key !== 'fieldName') {
                    model.unset(key);
                }
            });
            var selectedField = this.generateStatementOptions(model, fieldName);
            this.$fieldValue = this.$("input[name='"+FIELD_VALUE+"']");
            this.setValidationOptions(selectedField);
            $("#query-form").parsley(parsleyOpts);
        },

        generateStatementOptions: function(model, fieldName) {
            this.$("input[type=text]").select2('destroy');
            this.$("input[type=text]").addClass('hidden');
            this.$("input[type=text]").attr('required', false);

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
            return selectedField;
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
                    $el.removeClass('hidden');
                    $el.change(function() {
                        $el.trigger('input');
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
            selector.type = 'text';
            selector.className = 'form-control hidden';
            selector.name = FIELD_VALUE;
            $container.append(selector);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", {
                observe: 'fieldValue',
                initialize: function($el) {
                    $el.select2({
                        data: [{id: true, text: i18n('yes')}, {id: false, text: i18n('no')}]
                    });
                    $el.removeClass('hidden');
                    $el.change(function() {
                        $el.trigger('input');
                    });
                }
            });
        },

        appendComparedValueList: function(list) {
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("query-value-div");
            var selector = document.createElement("input");
            selector.type = 'text';
            selector.name = FIELD_VALUE;
            selector.className = 'form-control hidden';
            var data = list.map(function(elem) { return {"id":elem, "text":elem}; });
            $container.append(selector);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", {
                observe: 'fieldValue',
                initialize: function($el) {
                    $el.select2({
                        multiple: true,
                        data: data,
                        placeholder: i18n("please-select")
                    });
                    $el.removeClass('hidden');
                    $el.change(function() {
                        $el.trigger('input');
                    });
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
                        placeholder: i18n("please-select")
                    });
                    $el.removeClass('hidden');
                    $el.change(function() {
                        $el.trigger('input');
                    });
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
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' },
                                { id: 'LIKE', text: 'LIKE'}, { id: 'NOT LIKE', text: 'NOT LIKE'}]
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
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' },
                                { id: 'LIKE', text: 'LIKE'}, { id: 'NOT LIKE', text: 'NOT LIKE'}]
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
                        data: [ { id: '=', text: '=' }, { id: '<>', text: '≠' },
                                { id: '<=', text: '≤' }, { id: '>=', text: '≥' },
                                { id: '<', text: '<'}, {id: '>', text: '>'}]
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
                        return this.dataTypes.models.map(function(dataType) {
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
            this.isFirst = options.isFirst;
            if (this.isFirst) {
                this.model.set('multiProject',false);
            }
            else {
                if (_.isEmpty(options.model.attributes)) {
                    this.model.set('getMetadata', false);
                    this.model.set('label',"");
                }
                else {
                    this.model = options.model;
                }
            }
            this.dataTypesComplete = options.dataTypesComplete || [];
            this.dataTypePrivileges = options.dataTypePrivileges || [];
            // this.listenTo(this.model, 'change:dataType', this.dataTypeOnChange);
        },

        events: {
            'click [name="add-field"]': 'addQueryRow',
            // 'click [name="add-loop"]': 'addLoopQuery',
            'click [name="add-nested"]': 'nestedQueryBtnOnClick',
            'click [name="multi-search"]': 'multiQueryBtnOnClick',
            'click [name="get-metadata"]': 'getMetadataBtnOnClick',
            'click .remove-me-field': 'closeMeField',
            'click .clear-me': 'clearMe'
        },

        addQueryRow: function(ev) {
            ev.stopPropagation();
            var superType = new SuperType.Model( this.dataTypes.get(this.model.get('dataType')).get('superType'));
            var childView = new Query.Views.Row({fieldList: superType.getFlattenedFields(),
                                                model: new Query.RowModel()});
            this.$el.append(childView.render().el);
            this.add(childView);
        },

        closeMeField: function (ev) {
            ev.preventDefault();
            var that = this;
            $($(ev.currentTarget).closest('.query-row')).remove();
            _.forEach(this.nestedViews, function(val,i){
                if (_.isEqual(val.$el, $($(ev.currentTarget).closest('.query-row')))) {
                    that.nestedViews.splice(i,1);
                }

            });
        },

      /* *
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

        multiQueryBtnOnClick: function(ev) {
            ev.preventDefault();
            // ev.stopPropagation();
            this.$clearMe.addClass('hidden');
            $('div.query-composite',this.el).remove();
            this.nestedViews = _.filter(this.nestedViews, function(view){
                if( _.find(view.el.classList, function(classes){ return classes !== "query-composite";}) ){
                    return view;
                }
            });
            if (xtens.session.get('multiProject') === false) {
                this.$multiSearchButton.removeClass('btn-danger').addClass('btn-success');
                xtens.session.set('multiProject', true);
                this.setDataTypeChildren(function () {});
            }
            else if (xtens.session.get('multiProject') === true) {
                this.$multiSearchButton.removeClass('btn-success').addClass('btn-danger');
                xtens.session.set('multiProject', false);
                if (this.childrenDataTypes.length === 0) {
                    this.$addNestedButton.prop('disabled',true);
                }else {
                    this.$addNestedButton.prop('disabled',false);
                }
            }
            ev.stopPropagation();

        },

        getMetadataBtnOnClick: function(ev) {
            ev.stopPropagation();
            if (this.model.get('getMetadata') == false) {
                this.$getMetadataButton.children('.fa-check').css( "opacity", 1 );
                this.model.set('getMetadata', true);
            } else if (this.model.get('getMetadata') == true) {
                this.$getMetadataButton.children('.fa-check').css( "opacity", 0.15 );
                this.model.set('getMetadata', false);
            }
        },

        /**
         * @method
         * @name addNestedQuery
         * @description add a nested query element to the current composite view
         *
         */
        addNestedQuery: function(queryObj) {
            if (this.childrenDataTypes.length !== 0) {
            // create composite subview
                var childView = new Query.Views.Composite({
                    isFirst: false,
                    biobanks: this.biobanks,
                    dataTypes: xtens.session.get('multiProject') && this.filteredChildren ? this.filteredChildren : this.childrenDataTypes,
                    dataTypesComplete: this.dataTypesComplete,
                    dataTypePrivileges:this.dataTypePrivileges,
                    model: new Query.Model(queryObj)
                });
                this.$el.append(childView.render({}).el);
                this.add(childView);
                if (childView.model.get("getMetadata")) {
                    childView.$getMetadataButton.children('.fa-check').css( "opacity", 1 );
                }
                this.$clearMe.removeClass('hidden');
                childView.rendered = true;
            }
        },

      /**
       * @method
       * @name setDataTypeChildren
       * @description check if current DataType selected has children to handle addNestedQueryButton correctly
       *
       */
        setDataTypeChildren: function(callback) {
            var that = this;
            var childrenIds = _.map(this.selectedDataType.get("children"), 'id');
            this.childrenDataTypes = new DataType.List(_.filter(this.dataTypesComplete.models, function(dataType) {
                return childrenIds.indexOf(dataType.id) > -1;
            }));
            if (this.childrenDataTypes.length  === 0) {
                this.$addNestedButton.prop('disabled',true);
                callback();
                return;
            }
            if (xtens.session.get('multiProject')) {
                this.fetchDataTypesMultiProject(this.childrenDataTypes, this.selectedDataType.get("superType").id, function (filteredChildren) {
                    if (filteredChildren.length === 0) {
                        that.$addNestedButton.prop('disabled',true);

                    }else {
                        that.$addNestedButton.prop('disabled',false);
                        that.filteredChildren = filteredChildren;
                    }
                    callback();
                });
            }
            else {
                this.$addNestedButton.prop('disabled',false);
                callback();
            }
        },

        /**
         * @method
         * @name fetchDataTypesMultiProject
         * @param{Array} dataTypes - list of all possible children dataTypes
         * @param{integer} superTypeSelected - the superType ID of the selected Data Type
         * @description fetch all possibily children dataTypes based on selected SuperType project(s)
         *
         */
        fetchDataTypesMultiProject: function (dataTypes, superTypeSelected, callback) {
            var dtsSuperTypeFetch = new DataType.List();
            var dtsDefferred = dtsSuperTypeFetch.fetch({
                data: $.param({superType: superTypeSelected})
            });

            $.when(dtsDefferred).then(function (dtsResults) {

                var projectParents = _.map(dtsResults, 'project');
                var requests = [];
                var dtsFetch = new DataType.List();
                for (var i = 0; i < dataTypes.length; i++) {
                    requests.push(dtsFetch.fetch({
                        data: $.param({superType: dataTypes.models[i].get('superType').id})
                    }));
                }
                $.when.apply($, requests).then(function () {
                    var results = new DataType.List();
                    $.map(arguments, function (arg,i) {
                        var toBeIncluded = true;
                        _.forEach(arg[0], function (dt) {
                            if (projectParents.indexOf(dt.project) === -1) {
                                toBeIncluded = false;
                            }
                        });
                        if (arg[0].length > 1 && toBeIncluded) {
                            results.add(dataTypes.models[i]);
                        }
                    });
                    callback(results);
                });
            });
        },


        /**
         * @method
         * @name dataTypeOnChange
         * @param{DataType.Model} model - the Backbone current model, not used in the function
         * @param{integer} idDataType - the ID of the selected Data Type
         */
        dataTypeOnChange: function(model, idDataType) {
            this.clear(true);
            if (!idDataType) {
                this.$multiSearchButton.addClass('hidden');
                this.$addFieldButton.addClass('hidden');
                this.$addLoopButton.addClass('hidden');
                this.selectedDataType = null;
                this.model.set("model", null);
            }
            else {
                if(this.isFirst) {
                    xtens.session.set('multiProject', false);
                    this.createDataTypeRow(idDataType);
                    this.setMultiProjectButton(false, false, function () {
                        $('input#search').prop('disabled',false);
                    });
                }else {
                    this.createDataTypeRow(idDataType);
                }
            }

        },

        /**
         * @method
         * @name setMultiProjectButton
         * @param{boolean} isYetMulti - it suggests if the query is or not a multi Project query
         * @param{boolean} triggedSearch - it suggests if the query is triggered or not
         * @description check if current query is triggered and/or is multi Project to handle multiSearchButton correctly
         *
         */
        setMultiProjectButton: function(isYetMulti, triggedSearch, callback) {

            this.$multiSearchButton.removeClass('btn-success').addClass('btn-danger');

            if (!isYetMulti) {
                var that = this;
                var superTypeSelected = _.isObject(this.selectedDataType.get('superType')) ? this.selectedDataType.get('superType').id : this.selectedDataType.get('superType');
                var dataTypes = new DataType.List();

                var dataTypesDeferred = dataTypes.fetch({
                    data: $.param({superType: superTypeSelected})
                });
                $.when(dataTypesDeferred).then(function(dataTypesRes) {
                    if (dataTypesRes.length > 1) {
                        that.$multiSearchButton.removeClass('hidden');
                    }
                    else {
                        that.$multiSearchButton.addClass('hidden');
                    }
                    callback();
                });
            }
            else if (isYetMulti && triggedSearch) {
                // setTimeout(function () {
                this.$multiSearchButton.removeClass('btn-danger').addClass('btn-success').removeClass('hidden');
                callback();
                // }, 750);
            }else {
                callback();
            }
        },

        /**
         * @method
         * @name createDataTypeRow
         * @param{integer} idDataType
         */
        createDataTypeRow: function(idDataType) {
            var personalInfoQueryView, modelQueryView, childView, queryContent = this.model.get("content"), that = this;
            this.selectedDataType = this.dataTypes.get(idDataType);
            this.selectedPrivilege = this.dataTypePrivileges.findWhere({'dataType' : idDataType});
            this.model.set("model", this.selectedDataType.get("model"));
            if (!this.isFirst) {
                var label = this.selectedDataType.get("name").toLowerCase().replace(/[||\-*/,=<>~!^()\ ]/g,"_");
                this.model.set("label", label);
                this.model.set("title", this.selectedDataType.get("name"));
                this.model.set("superType", this.selectedDataType.get("superType").id);
            }
            if (this.model.get("model") === DataTypeClasses.SUBJECT && xtens.session.get('canAccessPersonalData')) {
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
            if (xtens.session.get("isWheel") || this.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW) {
                this.$addFieldButton.removeClass('hidden');
                if (!this.isFirst) {
                    this.$getMetadataButton.removeClass('hidden');
                }
            }
            else if (this.selectedPrivilege.get('privilegeLevel') === VIEW_OVERVIEW) {
                this.$addFieldButton.addClass('hidden');
            }

            var selectedSuperType = new SuperType.Model(this.selectedDataType.get("superType"));
            var flattenedFields = selectedSuperType.getFlattenedFields();
            if (!xtens.session.get('canAccessSensitiveData') && this.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW){
                flattenedFields = _.filter(flattenedFields, function(field) { return !field.sensitive; });
            }

            this.setDataTypeChildren(function () {
                if ((that.filteredChildren && that.filteredChildren.length > 0) ||that.childrenDataTypes.length !== 0) {
                    that.$addNestedButton.removeClass('hidden');
                }
                if (_.isArray(queryContent) && queryContent.length > 0) {
                    _.each(queryContent, function(queryElem) {
                    // it is a nested a nested composite element
                        if (queryElem.specializedQuery || queryElem.personalDetails) {
                            return true;  // continue to next iteration
                        }
                        else if (queryElem.dataType) {
                            that.addNestedQuery(queryElem);

                        }
                    // it is a leaf query element
                    else {
                            if (that.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW) {
                                childView = new Query.Views.Row({
                                    fieldList: flattenedFields,
                                    model: new Query.RowModel(queryElem)
                                });
                                that.addSubqueryView(childView);
                            }
                        }
                    }, that);
                }
                else {
                    if (xtens.session.get("isWheel") || that.selectedPrivilege.get('privilegeLevel') !== VIEW_OVERVIEW) {
                        childView = new Query.Views.Row({fieldList: flattenedFields, model: new Query.RowModel()});
                        that.$el.append(childView.render().el);
                        that.add(childView);
                    }
                }
            });

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
        clear: function(initialization) {
            var len = this.nestedViews.length;
            if (initialization) {
                for(var i=len-1; i>=0; i--) {
                    this.removeChild(this.nestedViews[i]);
                }
            } else {
                this.nestedViews = _.filter(this.nestedViews, function(view){
                    if( _.find(view.el.classList, function(classes){ return classes !== "query-composite";}) ){
                        return view;
                    }else {
                        view.remove();
                    }
                });
                this.$clearMe.addClass('hidden');
            }
        },

        /**
         * @method
         * @name render
         * @extends Backbone.View.render
         */
        render: function(options) {
            if (options.id) {} // load an existing query TODO
            else {
                this.$el.html(this.template({__: i18n, isFirst: this.isFirst }));
                this.stickit();
            }
            this.$addFieldButton = this.$("[name='add-field']");
            if (this.isFirst) {
                this.$multiSearchButton = this.$("[name='multi-search']");
            }
            else {
                this.$getMetadataButton = this.$("[name='get-metadata']");
            }
            this.$addLoopButton = this.$("[name='add-loop']");
            this.$addNestedButton = this.$("[name='add-nested']");
            this.$clearMe = this.$("[name='clear-me']");
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
            'submit #query-form': 'sendQuery'
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
            options.dataTypes.comparator = 'id';
            options.dataTypes.sort();
            this.dataTypes = options.dataTypes || [];
            this.dataTypePrivileges = options.dataTypePrivileges || [];
            this.render(options);
            xtens.session.set('multiProject', options.queryObj ? options.queryObj.multiProject : false);
            this.queryView = new Query.Views.Composite({
                isFirst: true,
                biobanks: this.biobanks,
                dataTypes: this.dataTypes,
                dataTypesComplete: this.dataTypes,
                dataTypePrivileges: this.dataTypePrivileges,
                model: new Query.Model(options.queryObj)
            });
            this.$tableCnt = this.$("#result-table-cnt");
            this.$queryModal = this.$(".query-modal");
            this.$queryNoResultCnt = this.$("#queryNoResultCnt");
            this.$queryErrorCnt = this.$("#queryErrorCnt");
            this.tableView = null;
            this.$form = this.$("#query-form");
            this.$('#buttonbardiv').before(this.queryView.render({}).el);
            this.listenToOnce(this, 'search', this.sendQuery);
            // if a query object exists trigger a server-side search
            if (options.queryObj) {
                // var that = this;
                this.queryView.setMultiProjectButton(options.queryObj.multiProject, true ,function(){
                  // TODO: wait async nestedviews rendering and then trigger search
                    // that.trigger('search'); // disabled

                });
            }
            else {
                this.$('input#search').prop('disabled',true);
            }
        },

        render: function() {
            this.$el.html(this.template({__: i18n }));

            return this;
        },


        /**
         * @method
         * @name sendQuery
         * @description compose the object with query parameters and send it through AJAX request to the server for executing a (sanitised) query
         * @return{boolean} false
         */
        sendQuery: function() {
            var that = this;
            var isStream = xtens.infoBrowser[0] === "Chrome" && xtens.infoBrowser[1] >= 54 ? true : false;
            isStream = false;
            // extend queryArgs with flags to retrieve subject and personal informations and if retrieve data in stream mode
            var serialized = this.queryView.serialize([]);

            var leafSearch = _.find(serialized.leafSearch, function (obj) {
                return obj.getMetadata === true;
            });

            this.leafSearch = {
                isLeafSearch: leafSearch && leafSearch.getMetadata ? true : false,
                info: serialized.leafSearch
            };
            this.multiProject = xtens.session.get('multiProject');
            var queryArgs = _.extend(serialized.res, {
                multiProject: this.multiProject,
                wantsSubject: true,
                leafSearch: this.leafSearch.isLeafSearch,
                wantsPersonalInfo: xtens.session.get('canAccessPersonalData')
            });

            var queryParameters = JSON.stringify({queryArgs: queryArgs});
            // console.log(this.queryView.serialize());
            var path = '/query/' + encodeURIComponent(queryParameters);
            xtens.router.navigate(path, {trigger: false});
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
                  return that.pumpStream(res.body.getReader(), queryArgs);
              })
              .catch(function(ex) {
                  // console.log('parsing failed', ex);
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
                    success: function (results) {
                        that.initializeDataTable(results,queryArgs);
                    },
                    error: this.queryOnError
                });
            }

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
        pumpStream: function(reader, queryArgs) {
            var that = this;
            return reader.read().then(function (result) {

                //if stream end and table is initialized
                if (result.done && that.tableInitialized) {
                  //if more data to be rendered
                    if(that.buffer.length !== 0){
                        that.tableView.addRowsDataTable(that.buffer);
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
                        parsed.dataTypes ? that.optStream.dataTypes = parsed.dataTypes :
                            parsed.dataTypePrivileges ? that.optStream.dataTypePrivileges = parsed.dataTypePrivileges :
                            parsed.error ? that.optStream.error = parsed.error :
                            !_.isEmpty(parsed) ? that.buffer.push(parsed) : null;
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

                if(!that.tableInitialized && ((that.optStream.dataTypes && that.optStream.dataTypePrivileges && that.buffer.length >= 8000) || (result.done && that.buffer.length >= 0))) {
                    var jsonParsed = {data:[]};
                    jsonParsed.dataTypes = that.optStream.dataTypes;
                    jsonParsed.dataTypePrivileges = that.optStream.dataTypePrivileges;
                    jsonParsed.data = that.buffer;
                    that.tableInitialized = true;
                    that.buffer = [];
                    that.initializeDataTable(jsonParsed, queryArgs);
                }

                return that.pumpStream(reader, queryArgs);

            });
        },

        /**
         * @method
         * @name initializeDataTable
         */
        initializeDataTable: function(result, queryArgs) {

            if (this.tableView) {
                this.tableView.destroy();
            }
            this.hideProgressbar();
            if (!result) this.queryOnError(null, null, "Missing result object");

            if (_.isEmpty(result.data)) {
                this.$queryNoResultCnt.show();
                return;
            }
            this.tableView = new XtensTable.Views.DataTable({result: result, leafSearch: this.leafSearch, multiProject: this.multiProject, queryArgs: queryArgs});
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
