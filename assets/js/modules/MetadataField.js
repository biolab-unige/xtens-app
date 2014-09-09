(function(xtens, MetadataField) {
    // Dependencies
    var constants = xtens.module("xtensconstants").Constants;
    var fieldTypes = xtens.module("xtensconstants").FieldTypes;
    var MetadataComponent = xtens.module("metadatacomponent");
    var i18n = xtens.module("i18n").en;

    MetadataField.Model = Backbone.Model.extend({

        defaults: {
            label: constants.METADATA_FIELD,
            name: null,
            ontologyUri: null,
            type: fieldTypes.STRING,
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

    MetadataField.Views.Edit = MetadataComponent.Views.Edit.fullExtend({
        
        tagName: 'div',
        className: 'metadataField',
        
        // template: _.template($("#metadata-field-form-template").html()),
        initialize: function() {
            this.template = JST['views/templates/metadatafield-edit.ejs'];
        },
        
        render: function() {
            this.$el.html(this.template({__: i18n, fieldTypes: fieldTypes}));
            return this;
        },

        events: {
            'click .remove-me': 'removeMe'
        },
        
        /*
        removeMe: function(ev) {
            this.remove();
            ev.stopPropagation();
        } */

    });

    MetadataField.List = Backbone.Collection.extend({
        model: MetadataField.Model
    });

} (xtens, xtens.module("metadatafield")));
