(function(xtens, Data) {

    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var MetadataComponent = xtens.module("metadatacomponent");
    var DataTypeModel = xtens.module("datatype").Model;
    var DataTypeCollection = xtens.module("datatype").List;

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
            this.metadataTemplate = JST["views/templates/data-edit-partial.ejs"];
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
            var $metadataContent = this.$("#metadataContent");
            var type = this.model.get('type');
            if (type) {
                $metadataContent.html(this.metadataTemplate({__: i18n, data: null}));
                this.$('#tags').select2({tags: []});
                var schema = this.getSelectedSchema(type);
                this.createMetadataForm(schema);
            }
            else {
                $metadataContent.html('');
            }
        },

        createMetadataForm: function(metadataSchema) {
            // TODO: to be changed!! Head for Behavioural driven design
            /*
            for (var i=0, len=metadataSchema.body.length; i<len; i++) {
                var view;
                this.$("#metadata-body").append(view.render().el);
                this.nestedViews.push(view);
            }*/
        }

    });

    Data.Views.List = Backbone.View.extend({});


} (xtens, xtens.module("data")));
