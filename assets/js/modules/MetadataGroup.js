(function(xtens, MetadataGroup) {

    // dependencies
    var i18n = xtens.module("i18n").en;

    // XTENS router alias
    var router = xtens.router;

    MetadataGroup.Views.Edit = Backbone.View.Extend({

        tagName: 'div',   
        className: 'metadataGroup',
        
        initialize: function() {
            this.template = JST["views/templates/metadatafield-edit.ejs"];
        },

        render: function(options) {
            this.$el.html(this.template({__: i18n}));
            return this;
        }

    });

} (xtens, xtens.module("metadatagroup")));
