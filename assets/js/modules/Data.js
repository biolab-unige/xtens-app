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

    Data.Views.Edit = MetadataComponent.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'data',

        initialize: function(options) {
            $('#main').html(this.el);
            this.dataTypes = options.dataTypes || []; 
            this.template = JST["views/templates/data-edit.ejs"];
            this.form = [];
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

        dataTypeOnChange: function() {
            console.log(this.model);
        }

    });

    Data.Views.List = Backbone.View.extend({});


} (xtens, xtens.module("data")));
