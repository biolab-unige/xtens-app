(function(xtens, MetadataComponent) {

    var i18n = xtens.module("i18n").en;

    MetadataComponent.Views.Edit = Backbone.View.extend({

        initialize: function() {
            this.template = null;   // no template implemented at this stage
        },

        render: function(component) { 
            this.$el.html(this.template({ __: i18n, component: component }));
            var content = component ? component.content : [];
            for (var i=0, len=content.length; i<len; i++) {
                this.addSubcomponent(content[i]);
            }
            return this;
        },

        removeMe: function(ev) {
            this.remove();
            ev.stopPropagation();
        } 

    });

} (xtens, xtens.module("metadatacomponent")));
