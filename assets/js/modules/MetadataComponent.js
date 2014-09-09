(function(xtens, MetadataComponent) {

    var i18n = xtens.module("i18n").en;

    MetadataComponent.Views.Edit = Backbone.View.extend({

        initialize: function() {
            this.template = null;   // no template implemented at this stage
        },

        render: function() {
            this.$el.html(this.template({ __: i18n, id: 0 }));
            return this;
        },

        removeMe: function(ev) {
            this.remove();
            ev.stopPropagation();
        } 

    });

} (xtens, xtens.module("metadatacomponent")));
