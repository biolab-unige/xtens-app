(function(xtens, MetadataLoop) {

    var i18n = xtens.module("i18n").en;
    var MetadataComponent = xtens.module("metadatacomponent");
    var MetadataField = xtens.module("metadatafield");
    var constants = xtens.module("xtensconstants").Constants;
    
    MetadataLoop.Model = Backbone.Model.extend({
        defaults: {
            label: constants.METADATA_LOOP,
            name: null
        }
    });

    MetadataLoop.Views.Edit = MetadataComponent.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'metadataLoop',
        
        bindings: {
            'input[name=name]': 'name'
        },

        // template: _.template($("#metadata-field-form-template").html()),
        initialize: function() {
            this.template = JST['views/templates/metadataloop-edit.ejs'];
            this.nestedViews = [];
        },

        events: {
            'click .remove-me': 'closeMe',
            'click .add-metadata-field': 'addMetadataFieldOnClick'
        },

        addMetadataFieldOnClick: function(ev) {
            this.add({label: constants.METADATA_FIELD});
            ev.stopPropagation();
        },
        
        add: function(field) {
            var model = new MetadataField.Model();
            var view = new MetadataField.Views.Edit({model: model});
            this.$('.metadataLoop-body').append(view.render(field).el);
            this.listenTo(view, 'closeMe', this.removeChild);
            this.nestedViews.push(view);
        }

    });

} (xtens, xtens.module("metadataloop")));
