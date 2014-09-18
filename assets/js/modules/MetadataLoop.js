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
        },

        addMetadataField: function(field) {
            var view = new MetadataField.Views.Edit({id: this.nestedViews.length});
            this.$('.metadataLoop-body').append(view.render(field).el);
            this.nestedViews.push(view);
            ev.stopPropagation();
            return false;

        }

    });

} (xtens, xtens.module("metadataloop")));
