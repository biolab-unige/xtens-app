(function(xtens, Data) {

    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var MetadataComponent = xtens.module("metadatacomponent");
    var DataTypeModel = xtens.module("datatype").Model;
    var DataTypeCollection = xtens.module("datatype").List;

    Data.Views.MetadataComponent = Backbone.View.extend({
        
        initialize: function(options) {
            this.template = options.template;
            this.component = options.component;
            this.nestedViews = [];
        },

        render: function() {
            this.$el.html(this.template({ __:i18n, component: this.component}));
            if (_.isArray(this.component.content)) {
                for (var i=0, len=content.length; i<len; i++) {
                    this.add(content[i]);
                }
            }
            return this;
        },
        
        add: function(child) {
            // TODO: we must use the factory here i guess
            this.nestedViews.push(child);
        },

        getChild: function(index) {
            return this.nestedViews[i];
        }

    });

    Data.Views.MetadataFieldInput = Data.Views.MetadataComponent.fullExtend({
       
        add: function() {
            return null;
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
        className: 'data-edit',

        initialize: function(options) {
            $('#main').html(this.el);
            this.dataTypes = options.dataTypes || []; 
            this.template = JST["views/templates/data-edit.ejs"];
            this.headerTemplate = JST["views/templates/data-edit-partial.ejs"];
            this.groupTemplate = JST["views/templates/metadatagroup-form.ejs"];
            this.metadataView = null;
            this.render(options);
        },

        render: function() {
            this.$el.html(this.template({__: i18n, data: null}));
            this.stickit();
            this.listenTo(this.model, 'change:type', this.dataTypeOnChange);
            return this;
        },

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
                }
            }
        },

        getSelectedSchema: function(idDataType) {
            return _.findWhere(this.dataTypes, {id: idDataType}).schema;
        },

        dataTypeOnChange: function() {
            var $metadataHeader = this.$("#metadata-header");
            var type = this.model.get('type');
            if (type) {
                $metadataHeader.html(this.headerTemplate({__: i18n, data: null}));
                this.$('#tags').select2({tags: []});
                var schema = this.getSelectedSchema(type);
                this.createMetadataForm(schema);
            }
            else {
                $metadataHeader.html('');
            }
        },

        createMetadataForm: function(metadataSchema) {
            for (var i=0, len=metadataSchema.body.length; i<len; i++) {
                var group = metadataSchema.body[i];
                var view = new Data.Views.MetadataComponent({template: this.groupTemplate, component: group});
                this.$("#metadata-body").append(view.render().el);
            }
        }

    });

    Data.Views.List = Backbone.View.extend({});


} (xtens, xtens.module("data")));
