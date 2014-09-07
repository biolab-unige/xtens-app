(function(xtens, MetadataLoop) {

    var i18n = xtens.module("i18n").en;
    var MetadataField = xtens.module("metadatafield");

    MetadataLoop.Views.Edit = Backbone.View.extend({
    
        tagName: 'div',
        className: 'metadataLoop',
        
        // template: _.template($("#metadata-field-form-template").html()),
        initialize: function() {
            this.template = JST['views/templates/metadataloop-edit.ejs'];
        },

        render: function() {
            this.$el.html(this.template({ __: i18n }));
            return this;
        },

        events: {
            'click .remove-me': 'removeMe'
        },

        removeMe: function(ev) {
            this.remove();
            ev.stopPropagation();
        }



    });
    

} (xtens, xtens.module("metadataloop")));
