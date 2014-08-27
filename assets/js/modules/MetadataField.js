(function(xtens, MetadataField) {
    // Dependencies
    var Constants = xtens.module("xtensconstants").Constants;
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;
    var i18n = xtens.module("i18n").en;

    MetadataField.Model = Backbone.Model.extend({

        defaults: {
            label: Constants.METADATA_FIELD,
            id: 0,
            name: null,
            ontologyUri: null,
            type: FieldTypes.STRING,
            required: false,
            customValue: null,
            isList: false,
            possibleValues: null,
            hasUnit: false,
            range: null
        },

        initialize: function() {

        },

    });

    MetadataField.View = Backbone.View.extend({

        // template: _.template($("#metadata-field-form-template").html()),
        initialize: function() {
            this.template = JST['views/templates/metadatafield.html'];
        },

        render: function() {
            this.$el.html(this.template({__: i18n}));
            return this;
        }
    });

    MetadataField.List = Backbone.Collection.extend({
        model: MetadataField.Model
    });

} (xtens, xtens.module("metadatafield")));
