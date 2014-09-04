(function(xtens, MetadataGroup) {

    // dependencies
    var i18n = xtens.module("i18n").en;

    // XTENS router alias
    var router = xtens.router;

    MetadataGroup.Views.Edit = Backbone.View.extend({

        tagName: 'div',   
        className: 'metadataGroup',
        
        initialize: function() {
            this.template = JST["views/templates/metadatagroup-edit.ejs"];
        },

        render: function(options) {
            var id = this.id;
            this.$el.html(this.template({__: i18n, id: 0}));
            return this;
        }

    });

} (xtens, xtens.module("metadatagroup")));
