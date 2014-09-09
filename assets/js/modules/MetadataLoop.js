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
        },
        
        /*
        render: function() {
            this.$el.html(this.template({ __: i18n }));
            return this;
        }, */

        events: {
            'click .remove-me': 'removeMe',
            'click .add-metadata-field': 'addMetadataField'
        },
        
        /*
        removeMe: function(ev) {
            this.remove();
            ev.stopPropagation();
        }, */

        addMetadataField: function(ev) {
            var view = new MetadataField.Views.Edit();
            this.$('.metadataLoop-body').append(view.render().el);
            ev.stopPropagation();
            return false;

        }

    });

} (xtens, xtens.module("metadataloop")));
