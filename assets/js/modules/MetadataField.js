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
            this.$("select").select2({width: 'resolve'});
            return this;
        },

        events: {
            'change .field-type': 'onFieldTypeChange',
            'click .remove-me': 'removeMe',
            'click .add-value-to-list': 'addValueToList',
            'click .add-unit-to-list': 'addUnitToList'
        },

        addValueToList: function(ev) {
            var value = this.$("input.value-to-add").val();
            var exists = false;
            this.$("select.value-list option").each(function() {
                if (this.value === value) {
                    exists = true;
                    return false;
                }
            });
            if (!exists) {
                this.$("select.value-list").append($("<option>").attr("value", value).html(value));
            }
            this.$("input.value-to-add").val("");
        },

        addUnitToList: function(ev) {
            var unit = this.$("input.unit-to-add").val();
            var exists = false;
            this.$("select.unit-list option").each(function() {
                if (this.value === unit) {
                    exists = true;
                    return false;
                }
            });
            if (!exists) {
                this.$("select.unit-list").append($("<option>").attr("value", unit).html(unit));
            }
            this.$("input.unit-to-add").val("");
        }

    });

    MetadataField.List = Backbone.Collection.extend({
        model: MetadataField.Model
    });

} (xtens, xtens.module("metadatafield")));
