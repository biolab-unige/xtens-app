(function(xtens, Sample) {

    var i18n = xtens.module("i18n").en;
    var DataType = xtens.module("datatype");
    var Data = xtens.module("data");

    Sample.Views.MetadataSchema = Data.Views.MetadataSchema.fullExtend({
        bindings: {}
    });

    Sample.Model = Backbone.Model.extend({
        urlRoot: '/sample'
    });

    Sample.List = Backbone.Collection.extend({
        model: Sample.Model,
        url: '/sample'
    });

    Sample.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'data',

        bindings: {

            '#biobank-code': {
                observe: 'biobankCode'
            },

            '#material-type': {
                observe: 'materialType',

                selectOptions: {
                    collection: 'this.materialTypes',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: i18n('please-select'),
                        value: null
                    }
                }

            },

            '#donor': {
                observe: 'donor',

                selectOptions: {
                    collection: 'this.donors',
                    labelPath: 'code',
                    valuePath: 'id',
                    defaultOption: {
                        label: i18n('please-select'),
                        value: null
                    }
                }
            },

            '#parentSample': {
                observe: 'parentSample',

                selectOptions: {
                    collection: [],
                    label: '',
                    value: '',
                    defaultOption: {
                        label: i18n('please-select'),
                        value: null
                    }
                }
            }

        },

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.template = JST["views/templates/sample-edit.ejs"];
            this.materialTypes = options.materialTypes;
            this.donors = options.donors;
            this.render(options);
        },

        render: function(options) {
            if (options.id) {
                this.model = new Sample.Model({id: options.id});
                this.model.fetch({
                    success: this.fetchSuccess
                });
            }
            else {
                this.$el.html(this.template({__: i18n, data: null}));
                this.stickit();
                this.listenTo(this.model, 'change:materialType', this.materialTypeOnChange);
            }
            return this;
        },

        fetchSuccess:function(sample) {
            this.$el.html(this.template({__: i18n, data: sample}));
            this.stickit();
            this.renderDataTypeSchema(subject);
        },

        materialTypeOnChange: function() {
            this.renderDataTypeSchema();
        },

        renderDataTypeSchema: function(sample) {
            // TODO: implement or inherit -> this must be chosen
        }

    });

} (xtens, xtens.module("sample")));
