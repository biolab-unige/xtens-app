/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Data and
 *              metadata instances
 */

(function(xtens, Data) {
    
    // TODO: retrieve this info FROM DATABASE ideally or from the server-side anyway
    var useFormattedNames = xtens.module("xtensconstants").useFormattedMetadataFieldNames; 

    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var MetadataComponent = xtens.module("metadatacomponent");
    var DataTypeModel = xtens.module("datatype").Model;
    var DataTypeCollection = xtens.module("datatype").List;
    var FileManager = xtens.module("filemanager");
    var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;
    var dateUtil = xtens.module("utils").date;

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


    /**
     *  @description general purpose function to retrieve the value from a field
     */
    function getFieldValue($el, ev, options) {
        switch (options.view.component.fieldType) {
            
            case FieldTypes.INTEGER:
                return parseInt($el.val());
            
            case FieldTypes.FLOAT:
                return parseFloat($el.val());

            // return the date string in ISO format
            case FieldTypes.DATE:
                var dateArray = $el.val().split("/");
                return dateArray[2] + '-'+ dateArray[1] + '-' + dateArray[0];
            
            default:
                return $el.val();

        }
    }
    
    /**
     * @description render a Date from the model to a view
     */
    function renderDateValue(value) {
        if (value) {
            var dateArray = value instanceof Date ? value.toISOString().split('-') : value.split('-');
            return dateArray[2] + '/' + dateArray[1] + '/' + dateArray[0];
        }
    }

    /**
     * @class
     * @name Factory 
     * @description Factory Method implementation for the Data.Views.* components
     */

    Data.Factory = function() {

        this.createComponentView = function(component, metadatarecord, groupName, params) {

            var model;
            if (component.label === Constants.METADATA_GROUP) {
                model = new Data.MetadataGroupModel(null, {metadata: metadatarecord, groupName: groupName});
                return new Data.Views.MetadataGroup({model: model, component: component});
            }
            if (component.label === Constants.METADATA_LOOP) {
                model = new Data.MetadataLoopModel(null, {metadata: metadatarecord, groupName: groupName});
                return new Data.Views.MetadataLoop({model: model, component: component });
            }
            else if (component.label === Constants.METADATA_FIELD) {
                model = new Data.MetadataFieldModel(null, {field: component, metadata: metadatarecord, groupName: groupName, loopParams: params});
                if (component.fieldType === FieldTypes.BOOLEAN) {
                    return new Data.Views.MetadataFieldCheckbox({model: model, component: component});
                }
                if (component.isList) {
                    return new Data.Views.MetadataFieldSelect({model: model, component: component}); 
                }
                /* else if (component.hasRange) {
                   return new Data.Views.MetadataFieldRange({model: model, component: component});
                   } */
                return new Data.Views.MetadataFieldInput({model: model, component: component});
            }

        };

    };

    // local Data.Factory instance - to be used inside the model
    var factory = new Data.Factory();

    /** 
     *  @class
     *  @name Data.MetadataFieldModel
     *  @extends Backbone.Model
     *  @description Backbone Model for a metadata field
     */

    Data.MetadataFieldModel = Backbone.Model.extend({
        defaults: {
            name: null,
            value: null,
            unit: null
        },

        /**
         * @extends Backbone.Model.initialize
         * @description initialize a generic MetadataField for editing purposes 
         */

        initialize: function(attributes, options) {
            var field = options.field || {};

            this.set("name", field.name);
            this.set("formattedName", field.formattedName);
            this.set("groupName", options.groupName);
            if (options.loopParams) {
                this.set("loop", options.loopParams.name);
            }

            var fieldName = useFormattedNames ? field.formattedName : field.name;

            // it is an existing data instance
            if (options.metadata && options.metadata[fieldName]) {
                var fieldRecord = options.metadata[fieldName];

                // if it is a field from a loop retrieve the value/unit pair from the values & units arrays
                if (options.loopParams) {
                    var index = options.loopParams.index || 0;
                    this.set("value", fieldRecord.values[index]);
                    if (field.hasUnit) {
                        this.set("unit", fieldRecord.units[index]);
                    }
                }

                // if it's not from a loop just set the value/unit pair
                else {
                    this.set("value", fieldRecord.value);
                    if (field.hasUnit) {
                        this.set("unit", fieldRecord.unit);
                    }
                }
            }

            // it is a new data instance
            else {
                if (field.fieldType === FieldTypes.BOOLEAN) {
                    // initialize new boolean to FALSE
                    this.set("value", false);
                }
                if (field.isList) {
                    this.set("value", field.possibleValues && field.possibleValues[0]);
                }
                if (field.hasUnit) {
                    this.set("unit", field.possibleUnits && field.possibleUnits[0]);
                }
            }
        }
    });

    /** 
     *  @class
     *  @name Data.MetadataGroupModel
     *  @description Backbone Model for a metadata group
     */
    Data.MetadataGroupModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.set("groupName", options && options.groupName);
            if (options && options.metadata) {
                this.metadata = options.metadata;
            }
        }
    });

    /**
     * @class
     * @name Data.MetadataLoopModel
     * @description Backbone Model for a metadata loop
     */
    Data.MetadataLoopModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.set("name", options && options.name);
            this.set("groupName", options && options.groupName); 
            if (options && options.metadata) {
                this.metadata = options.metadata;
            }
        }
    });

    /**
     * @class
     * @name Data.Views.MetadataComponent
     * @description Implements a generic metadata component view according to the Composite pattern
     */

    Data.Views.MetadataComponent = Backbone.View.extend({

        tagName: 'div',
        className: 'metadata',

        initialize: function(options) {
            this.template = options.template;
            this.component = options.component;
            this.nestedViews = [];
        },

        render: function() {
            this.$el.html(this.template({ __:i18n, component: this.component}));
            if (this.model) {
                this.stickit();
            }
            if (this.component) {
                var content = this.component.body || this.component.content;
                var len = content && content.length;
                for (var i=0; i<len; i++) {
                    var groupName = content[i].label === Constants.METADATA_GROUP ? content[i].name : this.model.get("groupName");
                    this.add(content[i], this.model.metadata, groupName);
                }
            }
            return this;
        },
        
        /**
         * @method
         * @name add
         * @description add a new subcomponent to the current object
         * @param {Object} subcomponent - the subelement that must be added
         * @param {Object} metadatarecord - the oprional record that must be used to populate the subcomponent fields. This is useful if
         *                 we are updating an existing Data/Metadata record
         * @param {string} groupName - the name of the parent metadataGroup NOTE: this should be moved somewhere else?? Set as a param object?
         */
        add: function(subcomponent, metadatarecord, groupName) {
            var view = factory.createComponentView(subcomponent, metadatarecord, groupName);
            this.$el.children('.metadatacomponent-body').last().append(view.render().el);
            this.nestedViews.push(view);
        },
        
        /**
         * @method
         * @name removeMe
         * @description remove the current object and all its subcomponents from the DOM tree
         */
        removeMe: function() {
            var len = this.nestedViews || this.nestedViews.length;
            for (var i=0; i<len; i++) {
                this.nestedViews[i].removeMe();
                delete this.nestedViews[i]; 
            }
            this.remove();
            return true;
        },
        
        /**
         * @method
         * @name getChild
         * @description get the i-th child subcomponent
         * @param {integer} - the zero-based index of the child
         * @return {Object} the required subcomponent
         */
        getChild: function(index) {
            return this.nestedViews[i];
        },
        
        /**
         * @method
         * @name serialize
         * @description iterate the serialize call through all the nested (i.e. children) views.
         * @return {Array} an array containg all the serialized components.
         */
        serialize: function(useFormattedNames) {
            // var json = {name: this.component.name, instances: []};
            var arr = [];
            if (this.nestedViews && this.nestedViews.length) {
                for (var i=0, len=this.nestedViews.length; i<len; i++) {
                    arr.push(this.nestedViews[i].serialize(useFormattedNames));
                }
            }
            return arr;
        }

    });

    Data.MetadataSchemaModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            var data = options && options.data;
            if (data) {
                this.metadata = data.get("metadata");
            }
        }
    });
    
    /**
     * @class 
     * @name Data.Views.MetadataSchema
     * @extends Data.Views.MetadataComponent
     * @description the view for the metadata schema - the composite element - of a Data instance
     */
    Data.Views.MetadataSchema = Data.Views.MetadataComponent.fullExtend({

        id: 'metadata-schema',
        className: 'metadataschema',

        initialize: function(options) {
            this.template = JST["views/templates/data-edit-partial.ejs"];
            this.component = options.component;
            this.nestedViews = [];
        },

        /**
         *  @method
         *  @name serialize
         *  @description serialize the metadadata schema to a JSON object
         *  @param{boolean} useFormattedNames - if set to true use name formatted to support JavaScript properties in dot notation (i.e. variable.property) 
         *  @return {Object} - an array containing all the metadata name-value-unit properties
         *  @override 
         */
        serialize: function(useFormattedNames) {
            var arr = [];
            var i, len;
            if (this.nestedViews && this.nestedViews.length) {
                for (i=0, len=this.nestedViews.length; i<len; i++) {
                    arr.push(this.nestedViews[i].serialize(useFormattedNames));
                }
            }
            var serialized = _.flatten(arr);
            var metadata = {};
            for (i=0, len=serialized.length; i<len; i++) {
                var unit = serialized[i].unit || undefined;
                
                // if formattedNames are used select the appropriate fieldName
                var fieldName = useFormattedNames ? serialized[i].formattedName : serialized[i].name;

                // if it's not a field of a loop just store the value/unit pair as an object
                if (!serialized[i].loop) {
                    metadata[fieldName] = {value: serialized[i].value, unit: unit, group: serialized[i].groupName};
                }

                // if it's a field within a loop store the value unit pair within two arrays
                else {
                    if (!metadata[fieldName]) {    
                        metadata[fieldName] = {values: [serialized[i].value], group: serialized[i].groupName, loop: serialized[i].loop};
                        metadata[fieldName].units = unit ? [unit] : undefined;
                    }
                    // if the loop value/unit arrays already exists push them in the arrays
                    else {
                        metadata[fieldName].values.push(serialized[i].value);
                        if (unit && _.isArray(metadata[fieldName].units)) {
                            metadata[fieldName].units.push(serialized[i].unit);
                        }
                    }
                }
            }
            return metadata;
        }

    });

    Data.Views.MetadataGroup = Data.Views.MetadataComponent.fullExtend({
        className: 'metadatagroup',

        initialize: function(options) {
            this.template = JST["views/templates/metadatagroup-form.ejs"];
            this.component = options.component;
            this.nestedViews = [];
        }
    });

    Data.Views.MetadataLoop = Data.Views.MetadataComponent.fullExtend({
        className: 'metadataloop',

        initialize: function(options) {
            this.template = JST["views/templates/metadataloop-form.ejs"];
            this.component = options.component;
            this.nestedViews = [];
            if (this.model.metadata) {
                var loopInstance = this.model.metadata[this.component.content[0].name];
                this.loopRecords = loopInstance ? loopInstance.values.length : 0;
            }
            else {
                this.loopRecords = 0;
            }
        },

        /**
         *  overrides the basic Data.Views.MetadataComponent render() method
         */
        render: function() {
            this.$el.html(this.template({ __:i18n, component: this.component}));
            this.$metadataloopBody = this.$(".metadataloop-body");
            if (this.component) {
                var content = this.component.content;
                var i, len = content && content.length;
                if (this.loopRecords > 0) {
                    for (i=0; i<this.loopRecords; i++) {
                        this.addLoopBody(i);
                    }
                }
            }
            return this;
        },

        /**
         *  @method
         *  @name add
         *  @description override  the basic Data,Views.MetadataComponent add() method
         */
        add: function(subcomponent, metadatarecord, groupName, loopParams) {
            // create a new field
            var view = factory.createComponentView(subcomponent, metadatarecord, groupName, loopParams);
            // add it to the current loop
            this.$metadataloopBody.children('.metadatacomponent-body').last().append(view.render().el);
            this.nestedViews.push(view);
        },

        events: {
            'click input[type=button]': 'addLoopBody'
        },
        
        /**
         * @method
         * @name addLoopBody
         * @description add a new body to the Loop view. Each body contains all the fields of the loop
         * @param {integer} the index of the body element, starting from 0
         */
        addLoopBody: function(index) {
            var newLoopbody = '<div class="metadatacomponent-body"></div>'; 
            this.$metadataloopBody.append(newLoopbody);
            /*
               var $last = this.$el.children('.metadatacomponent-body').last();
               $last.after(newLoopbody); */
            var len = this.component && this.component.content && this.component.content.length;
            var loopParams = { name: this.component.name, index: index };
            for (var i=0; i<len; i++) {
                this.add(this.component.content[i], this.model.metadata, this.model.get("groupName"), loopParams);
            }
        }

    });

    Data.Views.MetadataField = Data.Views.MetadataComponent.fullExtend({

        className: 'metadatafield',
        
        /**
         * @method
         * @name add
         * @description no operation - you can't add subcomponents to a leaf object
         * @override
         */
        add: function() {},
        
        /**
         * @method
         * @name getChild
         * @description no operation - a leaf has no children
         * @return {null}
         * @override
         */
        getChild: function(i) {
            return null;
        },

        render: function() {
            this.$el.html(this.template({ __:i18n, component: this.component, format: replaceUnderscoreAndCapitalize}));
            this.stickit();
            if (!_.isEmpty(this.component.possibleUnits)) {
                this.addBinding(null, 'select[name=fieldUnit]', {
                    observe: 'unit',
                    selectOptions: {
                        collection: 'this.component.possibleUnits',
                        labelPath: '',
                        valuePath: ''
                    }
                });
            }
            this.$fieldValue = this.$("[name='fieldValue']");
            if (this.setValidationOptions) {
                this.setValidationOptions();
            }
            return this;
        },

        /**
         * @method
         * @name serialize
         * @description serialize the metadata field. Being the leaf of our Composite object, this means cloning all its model attributes
         * @return {Object} the model attributes
         * @override
         */

        serialize: function() {
            return _.clone(this.model.attributes);
        }

    });

    Data.Views.MetadataFieldInput = Data.Views.MetadataField.fullExtend({

        bindings: {
            ':text[name=fieldValue]': {
                observe: 'value',
                getVal: getFieldValue,
                onGet: function(value, options) {
                    if (options.view.component && options.view.component.fieldType === FieldTypes.DATE) {
                       return renderDateValue(value); 
                    }
                    else {
                        return value;
                    }
                }
            }        
        },

        initialize: function(options) {
            this.template = JST["views/templates/metadatafieldinput-form.ejs"];
            this.component = options.component;
        },

        /**
         * @method
         * @name setValidationOptions
         * @description add HTML5/data tags to the metadata field for client-side validation
         *              with Parsley
         */
        setValidationOptions: function() {
            if (this.component.required) {
                this.$fieldValue.prop('required', true); 
            }
            switch (this.component.fieldType) {
                case FieldTypes.INTEGER:
                    this.$fieldValue.attr("data-parsley-type", "integer");
                break;
                case FieldTypes.FLOAT:
                    this.$fieldValue.attr("data-parsley-type", "number");
                break;
                case FieldTypes.DATE:
                    this.initDatepicker();
                break;
            }
            if (this.component.hasRange) {
                this.$fieldValue.attr("min", this.component.min);
                this.$fieldValue.attr("max", this.component.max);
                // TODO add step validation?
            }
        },

        initDatepicker: function() {
            var picker = new Pikaday({
                field: this.$fieldValue[0],
                format: 'DD/MM/YYYY',
                yearRange: [1900, new Date().getYear()],
                maxDate: new Date()
            });
        }

    });

    Data.Views.MetadataFieldCheckbox = Data.Views.MetadataField.fullExtend({

        bindings: {
            ':checkbox[name=fieldValue]': {
                observe: 'value',
                getVal: function($el, ev, options) {
                    return $el.prop('checked');
                }
            } 
        },

        initialize: function(options) {
            this.template = JST["views/templates/metadatafieldcheckbox-form.ejs"];
            this.component = options.component;
        }

    });


    Data.Views.MetadataFieldSelect = Data.Views.MetadataField.fullExtend({

        bindings: {
            'select[name=fieldValue]': {
                observe: 'value',
                selectOptions: {
                    collection: 'this.component.possibleValues',
                    labelPath: '',
                    valuePath: ''
                }
            }        
        },

        initialize: function(options) {
            this.template = JST["views/templates/metadatafieldselect-form.ejs"];
            this.component = options.component;
        }

    });

    Data.Views.MetadataFieldRange = Data.Views.MetadataField.fullExtend({

        bindings: {
            'input[name=fieldValue]': {
                observe: 'value'
            }        
        },

        initialize: function(options) {
            this.template = JST["views/templates/metadatafieldrange-form.ejs"];
            this.component = options.component;
        }

    });

    Data.Model = Backbone.Model.extend({

        defaults: {
            type: null
        },

        urlRoot: '/data'
    });

    Data.List = Backbone.Collection.extend({
        model: Data.Model,
        url: '/data',
    });

    Data.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'data',

        initialize: function(options) {
            // _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.template = JST["views/templates/data-edit.ejs"];
            this.schemaView = null;
            this.dataTypes = options.dataTypes || [];
            // _.extend(this, options);
            if (options.data) {
                this.model = new Data.Model(options.data);
            }
            else {
                this.model = new Data.Model();
            }
            _.each(["parentSubject","parentSample", "parentData"], function(parent) {
                if(options[parent]) {
                    this.model.set(parent, options[parent]);
                }
            }, this);
            this.render();
        },

        render: function() {
            this.$el.html(this.template({__: i18n, data: this.model}));
            this.$form = this.$('form');
            this.$fileCnt = this.$("#data-header-row");
            this.stickit();
            this.listenTo(this.model, 'change:type', this.dataTypeOnChange);
            this.$('#tags').select2({tags: []});

            // initialize Parsley
            this.$form.parsley(parsleyOpts);
            /*
               this.$form.parsley(parsleyOpts);
               this.$form.parsley().subscribe('parsley:field:error', this.showValidationErrorTooltip);
               this.$form.parsley().subscribe('parsley:field:success', this.removeValidationErrorTooltip);
               */
            if (this.model.get("type")) {
                this.renderDataTypeSchema(this.model);
            }
            return this;
        },
        
        /**
         * @description Backbone.stickit bindings
         */
        bindings: {
            '#dataType': {
                observe: 'type',
                selectOptions: {
                    collection: 'this.dataTypes',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: i18n("please-select"),
                        value: null
                    } 
                },
                getVal: function($el, ev, options) {
                    var value = parseInt($el.val());
                    return _.isNaN(value) ? null : value;
                    // return _.findWhere(options.view.dataTypes, {id: value });
                },
                onGet: function(val, options) {
                    // if you get the whole DataType object you must retrieve the ID
                    if (_.isObject(val)) {
                        return (val && val.id);
                    }
                    // otherwise you've already the ID
                    else {
                        return val;
                    }
                }
            },

            '#date': {
                observe: 'date',

                // format date on model as ISO (YYYY-MM-DD)
                onSet: function(val, options) {
                    var dateArray = val.split("/");
                    return new Date(dateArray[2] + '-'+ dateArray[1] + '-' + dateArray[0]);
                },

                // store data in view (from model) as DD/MM/YYYY (European format)
                onGet: function(value, options) {
                    if (value) {
                        var dateArray = value instanceof Date ? value.toISOString().split('-') : value.split('-');
                        return dateArray[2] + '/' + dateArray[1] + '/' + dateArray[0];
                    }
                },
                // initialize Pikaday + Moment.js
                initialize: function($el, model, options) {
                    var picker = new Pikaday({
                        field: $el[0],
                        format: 'DD/MM/YYYY',
                        minDate: moment('2006-01-01').toDate(),
                        maxDate: new Date()
                    });
                }
            },
            '#tags': {
                observe: 'tags',
                getVal: function($el, ev, option) {
                    return $el.val().split(",");
                }
            },

            '#notes': {
                observe: 'notes'
            }

        },

        events: {
            "click #save": "saveData",
            "click button.delete": "deleteData"
        },
        
        /**
         * @method
         * @name saveData
         * @description retrieve all the Data properties from the form (the metadata value(s)-unit(s) pairs, the files' paths, etc...)
         *              and save the Data model on the server
         * @param {event} - the form submission event
         * @return {false} - to suppress the HTML form submission 
         */
        saveData: function(ev) {
            var targetRoute = $(ev.currentTarget).data('targetRoute') || 'data';
            if (this.schemaView && this.schemaView.serialize) {
                var metadata = this.schemaView.serialize(useFormattedNames);
                this.model.set("metadata", metadata);
                // this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
                this.retrieveAndSetFiles();
                console.log(this.model);
                this.model.save(null, {
                    success: function(data) {
                        xtens.router.navigate(targetRoute, {trigger: true});
                    },
                    error: function(model, res) {
                        xtens.error(res);
                    } 
                });
            }
            return false;
        },

        /**
         * @method
         * @name deleteDate
         * TODO - not implemented yet
         */
        deleteData: function(ev) {
            ev.preventDefault();
            return false;
        },

        getSelectedSchema: function(dataType) {
            var idDataType;
            if (typeof dataType === "object") {
                idDataType = dataType && dataType.id;
            }
            else {
                idDataType = dataType;
            }
            return _.findWhere(this.dataTypes, {id: idDataType}).schema;
        },

        dataTypeOnChange: function() {
            this.renderDataTypeSchema();
        },
        
        /**
         * @method
         * @name renderDataTypeSchema
         * @description render the view for the specific DataType (metadata) schema. If required create the view for file upload
         * @param {Object} data - the Data model to populate the form (e.g. on data update)
         *
         */
        renderDataTypeSchema: function(data) {
            if (this.fileUploadView) {
                this.fileUploadView.remove();
            }
            if (this.schemaView) {
                if (!this.schemaView.removeMe()) {
                    return;
                }
            }
            var type = this.model.get('type');
            if (type) {
                var schema = this.getSelectedSchema(type);
                var schemaModel = new Data.MetadataSchemaModel(null, {data: data});
                this.schemaView = new Data.Views.MetadataSchema({
                    component: schema,
                    model: schemaModel
                });
                this.$("#buttonbardiv").before(this.schemaView.render().el);
                if (schema.header.fileUpload) {
                    this.enableFileUpload();
                }
            }
            else {
                this.$("#buttonbardiv").before();
            }
            // reinitialize parsley
            this.$form.parsley(parsleyOpts).reset();
        },
        
        /**
         * @method
         * @name enableFileUpload
         * @description open the view for uploading files to the Distributes File System
         *
         */
        enableFileUpload: function() {
            var _this = this;
            var fileManager = new FileManager.Model();
            $.ajax({
                url: '/fileManager',
                type: 'GET',
                contentType: 'application/json',
                success: function(fileSystem) {
                    _this.fileUploadView = new FileManager.Views.Dropzone({
                        fileSystem: fileSystem,

                        // added the second condition for the scenarios where the dataType is not populated
                        dataTypeName: _this.model.get("type").name || _.findWhere(_this.dataTypes, {id: _.parseInt(_this.model.get("type"))}).name
                    });
                    _this.$fileCnt.append(_this.fileUploadView.render().el);
                    _this.fileUploadView.initializeDropzone(_this.model.get("files"));
                },
                error: xtens.error
            });
        },

        retrieveAndSetFiles: function() {
            if (this.fileUploadView) {
                if (!this.model.id) {   // don't change the "files" attribute on update
                    var files = this.fileUploadView.fileList.toJSON();
                    if (!_.isEmpty(files)) {
                        this.model.set("files", files);
                    }
                }
            }
        },

        showValidationErrorTooltip: function(formElement) {
            var messages = ParsleyUI.getErrorsMessages(formElement);
            formElement.$element.tooltip('destroy');
            formElement.$element.tooltip({
                animation: false,
                container: 'body',
                placement: 'right',
                trigger: 'manual',
                title: messages
            }).tooltip('show');
        },

        removeValidationErrorTooltip: function(formElement) {
            formElement.$element.tooltip('destroy');
        }

    });
    
    /**
     * @class
     * @name Data.Views.Details
     * @description view containing the details (metadata and files) of a Data (Data.Model) instance
     */
    Data.Views.Details = Backbone.View.extend({
    
    });

    Data.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'data',
        
        /**
         * @extends Backbone.View.initialize
         */
        initialize: function(options) {
            $("#main").html(this.el);
            this.dataTypes = options.dataTypes;
            this.data = options.data;
            this.template = JST["views/templates/data-list.ejs"];
            this.addLinksToModels();
            this.render();
        },

        addLinksToModels: function() {
            _.each(this.data.models, function(data) {
                var type = this.dataTypes.get(data.get("type").id);
                data.set("editLink", "#/data/edit/" + data.id);
                var dataTypeChildren = _.where(type.get("children"), {"model": Classes.DATA});
                if (dataTypeChildren.length > 0) { 
                    var dids = _.pluck(dataTypeChildren, 'id').join();
                    data.set("newDataLink", "#/data/new/0?idDataTypes="+dids+"&parentData="+data.id);
                }
            }, this);
        },

        render: function(options) {
            this.$el.html(this.template({__: i18n, data: this.data.models}));
            return this;
        }

    });


} (xtens, xtens.module("data")));
