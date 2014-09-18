(function(xtens, MetadataGroup) {

    // dependencies
    var i18n = xtens.module("i18n").en;
    var MetadataComponent = xtens.module("metadatacomponent");
    var MetadataField = xtens.module("metadatafield");
    var MetadataLoop = xtens.module("metadataloop");
    

    // XTENS router alias
    var router = xtens.router;

    MetadataGroup.Model = Backbone.Model.extend({});

    MetadataGroup.List = Backbone.Collection.extend({
        model: MetadataGroup.Model
    });

    MetadataGroup.Views.Edit = MetadataComponent.Views.Edit.fullExtend({
        
        // model: MetadataGroup.Model,

        tagName: 'div',   
        className: 'metadataGroup',
        
        initialize: function() {
            this.template = JST["views/templates/metadatagroup-edit.ejs"];
            this.nestedViews = [];
        },
        
        /*
        render: function(options) {
            var id = this.id;
            this.$el.html(this.template({__: i18n, id: 0}));
            return this;
        }, */

        events: {
            'click .add-metadata-field': 'addMetadataFieldOnClick',
            'click .add-metadata-loop': 'addMetadataLoopOnClick',
            'click .remove-me': 'removeMe'
        },

        addMetadataFieldOnClick: function(ev) {
            this.addMetadataField(null);
        },

        addMetadataLoopOnClick: function(ev) {
            this.addMetadataLoop(null);
        },

        addMetadataField: function(field) {
            var view = new MetadataField.Views.Edit({id: this.nestedViews.length});
            this.$('.metadataGroup-body').append(view.render(field).el);
            this.nestedViews.push(view);
            return false;
        },

        addMetadataLoop: function(loop) {
            var view = new MetadataLoop.Views.Edit();
            this.$('.metadataGroup-body').append(view.render(loop).el);
            this.nestedViews.push(view);
            return false;
        },
        
        /*
        removeMe: function(ev) {
            this.remove();
            ev.stopPropagation();
        } */

    });

} (xtens, xtens.module("metadatagroup")));
