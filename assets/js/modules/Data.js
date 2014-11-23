/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Data and
 *              metadata instances
 */

(function(xtens, Data) {

    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var MetadataComponent = xtens.module("metadatacomponent");
    var DataTypeModel = xtens.module("datatype").Model;
    var DataTypeCollection = xtens.module("datatype").List;
    var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;

    /**
     *  general purpose function to retrieve the value from a field
     */
    function getFieldValue($el, ev, options) {
        switch (options.view.component.fieldType) {
            case FieldTypes.INTEGER:
                return parseInt($el.val());
            case FieldTypes.FLOAT:
                return parseFloat($el.val());
            default:
                return $el.val();
        }
    }

    /**
     * Factory Method implementation for the Data.Views.* components
     */

    Data.Factory = function() {

        this.createComponentView = function(component, metadatarecord, params) {

            var model;
            if (component.label === Constants.METADATA_GROUP) {
                model = new Data.MetadataGroupModel(null, {metadata: metadatarecord});
                return new Data.Views.MetadataGroup({model: model, component: component});
            }
            if (component.label === Constants.METADATA_LOOP) {
                model = new Data.MetadataLoopModel(null, {metadata: metadatarecord});
                return new Data.Views.MetadataLoop({model: model, component: component });
            }
            else if (component.label === Constants.METADATA_FIELD) {
                model = new Data.MetadataFieldModel(null, {field: component, metadata: metadatarecord, loopParams: params});
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
     *  Backbone Model for a metadata field
     */

    Data.MetadataFieldModel = Backbone.Model.extend({
        defaults: {
            name: null,
            value: null,
            unit: null
        },

        initialize: function(attributes, options) {
            var field = options.field || {};
            this.set("name", field.name);
            if (options.loopParams) {
                this.set("loop", options.loopParams.name);
            }
            if (options.metadata && options.metadata[field.name]) {
                var fieldRecord = options.metadata[field.name];
                var index = (options.loopParams && options.loopParams.index) || 0;
                this.set("value", fieldRecord.value[index]);
                this.set("unit", fieldRecord.unit[index]);
            }
            else {
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
     *  Backbone Model for a metadata group
     */
    Data.MetadataGroupModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            if (options && options.metadata) {
                this.metadata = options.metadata;
            }
        }
    });

    /**
     *  Backbone Model for a metadata loop
     */
    Data.MetadataLoopModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.set("name", options && options.name); 
            if (options && options.metadata) {
                this.metadata = options.metadata;
            }
        }
    });

    /**
     * Implements a generic metadata component view according to the Composite pattern
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
                    this.add(content[i], this.model.metadata);
                }
            }
            return this;
        },

        add: function(subcomponent, metadatarecord) {
            var view = factory.createComponentView(subcomponent, metadatarecord);
            this.$el.children('.metadatacomponent-body').last().append(view.render().el);
            this.nestedViews.push(view);
        },

        removeMe: function() {
            var len = this.nestedViews || this.nestedViews.length;
            for (var i=0; i<len; i++) {
                this.nestedViews[i].removeMe();
                delete this.nestedViews[i]; 
            }
            this.remove();
            return true;
        },

        getChild: function(index) {
            return this.nestedViews[i];
        },

        serialize: function() {
            // var json = {name: this.component.name, instances: []};
            var arr = [];
            if (this.nestedViews && this.nestedViews.length) {
                for (var i=0, len=this.nestedViews.length; i<len; i++) {
                    arr.push(this.nestedViews[i].serialize());
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
                /*
                   this.set("date", data.get("date"));
                   this.set("tags", data.get("tags"));
                   this.set("notes", data.get("notes")); */
            }
        }

    });

    Data.Views.MetadataSchema = Data.Views.MetadataComponent.fullExtend({

        id: 'metadata-schema',
        className: 'metadataschema',

        initialize: function(options) {
            this.template = JST["views/templates/data-edit-partial.ejs"];
            this.component = options.component;
            this.nestedViews = [];
        },

        serialize: function() {
            var arr = [];
            var i, len;
            if (this.nestedViews && this.nestedViews.length) {
                for (i=0, len=this.nestedViews.length; i<len; i++) {
                    arr.push(this.nestedViews[i].serialize());
                }
            }
            var serialized = _.flatten(arr);
            var metadata = {};
            for (i=0, len=serialized.length; i<len; i++) {
                if (!metadata[serialized[i].name]){
                    metadata[serialized[i].name] = {value: [serialized[i].value], unit: [serialized[i].unit], loop: serialized[i].loop};
                }
                else {
                    metadata[serialized[i].name].value.push(serialized[i].value);
                    metadata[serialized[i].name].unit.push(serialized[i].unit);
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
                this.loopRecords = loopInstance ? loopInstance.value.length : 1;
            }
            else {
                this.loopRecords = 1;
            }
        },

        /**
         *  overrides the basic Data.Views.MetadataComponent render() method
         */
        render: function() {
            this.$el.html(this.template({ __:i18n, component: this.component}));
            if (this.component) {
                var content = this.component.content;
                var i, len = content && content.length;
                for (i=0; i<len; i++) {
                    this.add(content[i], this.model.metadata, {name: this.component.name});
                }
                if (this.loopRecords > 1) {
                    for (i=1; i<this.loopRecords; i++) {
                        this.addLoopBody(i);
                    }
                }
            }
            return this;
        },

        /**
         *  override  the basic Data,Views.MetadataComponent add() method
         */

        add: function(subcomponent, metadatarecord, loopParams) {
            var view = factory.createComponentView(subcomponent, metadatarecord, loopParams);
            this.$el.children('.metadatacomponent-body').last().append(view.render().el);
            this.nestedViews.push(view);
        },

        events: {
            'click input[type=button]': 'addLoopBody'
        },

        addLoopBody: function(index) {
            var newLoopbody = '<div class="metadatacomponent-body"></div>'; 
            var $last = this.$el.children('.metadatacomponent-body').last();
            $last.after(newLoopbody);
            var len = this.component && this.component.content && this.component.content.length;
            var loopParams = { name: this.component.name, index: index };
            for (var i=0; i<len; i++) {
                this.add(this.component.content[i], this.model.metadata, loopParams);
            }
        }

    });

    Data.Views.MetadataField = Data.Views.MetadataComponent.fullExtend({

        className: 'metadatafield',

        add: function() {},

        getChild: function(i) {
            return null;
        },

        render: function() {
            this.$el.html(this.template({ __:i18n, component: this.component, format: replaceUnderscoreAndCapitalize}));
            this.stickit();
            return this;
        },

        serialize: function() {
            return _.clone(this.model.attributes);
        }

    });

    Data.Views.MetadataFieldInput = Data.Views.MetadataField.fullExtend({

        bindings: {
            ':text[name=fieldValue]': {
                observe: 'value',
                getVal: getFieldValue
            },
            'select[name=fieldUnit]': {
                observe: 'unit',
                selectOptions: {
                    collection: 'this.component.possibleUnits',
                    labelPath: '',
                    valuePath: ''
                }
            }
        },

        initialize: function(options) {
            this.template = JST["views/templates/metadatafieldinput-form.ejs"];
            this.component = options.component;
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
            },
            'select[name=fieldUnit]': {
                observe: 'unit',
                selectOptions: {
                    collection: 'this.component.possibleUnits',
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
            },
            'select[name=fieldUnit]': {
                observe: 'unit',
                selectOptions: {
                    collection: 'this.component.possibleUnits',
                    labelPath: '',
                    valuePath: ''
                }
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
            this.stickit();
            this.listenTo(this.model, 'change:type', this.dataTypeOnChange);
            this.$('#tags').select2({tags: []});
            if (this.model.get("type")) {
                this.renderDataTypeSchema(this.model);
            }
            return this;
        },
        /*
        fetchSuccess:function(data) {
            this.$el.html(this.template({__: i18n, data: data}));
            this.stickit();
            this.$('#tags').select2({tags: []});
            this.renderDataTypeSchema(data);
        }, */

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
                    return _.findWhere(options.view.dataTypes, {id: value });
                },
                onGet: function(val, options) {
                    return (val && val.id);
                }
            },

            '#date': {
                observe: 'date',
                onGet: function(value) {
                    return new Date(value);
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
            "click #save": "saveData"
        },

        saveData: function(ev) {
            var targetRoute = $(ev.currentTarget).data('targetRoute') || 'data';
            if (this.schemaView && this.schemaView.serialize) {
                var metadata = this.schemaView.serialize();
                this.model.set("metadata", metadata);
                // this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
                this.model.save(null, {
                    success: function(data) {
                        xtens.router.navigate(targetRoute, {trigger: true});
                    },
                    error: function(err) {
                        console.log(err);
                    }
                });
            }
            return false;
        },

        getSelectedSchema: function(idDataType) {
            return _.findWhere(this.dataTypes, {id: idDataType}).schema;
        },

        dataTypeOnChange: function() {
            this.renderDataTypeSchema();
        },

        renderDataTypeSchema: function(data) {
            if (this.schemaView) {
                if (!this.schemaView.removeMe()) {
                    return;
                }
            }
            var type = this.model.get('type');
            if (type) {
                var schema = type.schema;
                var schemaModel = new Data.MetadataSchemaModel(null, {data: data});
                this.schemaView = new Data.Views.MetadataSchema({
                    component: schema,
                    model: schemaModel
                });
                this.$("#buttonbardiv").before(this.schemaView.render().el);
            }
            else {
                this.$("#buttonbardiv").before();
            }
        }

    });

    Data.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'data',

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
                var dataTypeChildren = _.where(type.get("children"), {"classTemplate": Classes.GENERIC});
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
