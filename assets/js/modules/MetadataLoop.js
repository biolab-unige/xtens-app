(function(xtens, MetadataLoop) {

    var i18n = xtens.module("i18n").en;
    var MetadataComponent = xtens.module("metadatacomponent");
    var MetadataField = xtens.module("metadatafield");

    MetadataLoop.Views.Edit = MetadataComponent.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'metadataLoop',

        // template: _.template($("#metadata-field-form-template").html()),
        initialize: function() {
            this.template = JST['views/templates/metadataloop-edit.ejs'];
            this.nestedViews = [];
        },

        events: {
            'click .remove-me': 'removeMe',
            'click .add-metadata-field': 'addMetadataFieldOnClick'
        },

        addMetadataFieldOnClick: function(ev) {
            this.addMetadataField(null);
            ev.stopPropagation();
        },

        addSubcomponent: function(subcomponent) {
            this.addMetadataField(subcomponent);
        },

        addMetadataField: function(field) {
            var view = new MetadataField.Views.Edit();
            this.$('.metadataLoop-body').append(view.render(field).el);
            this.nestedViews.push(view);
            return false;
        }

    });

} (xtens, xtens.module("metadataloop")));
