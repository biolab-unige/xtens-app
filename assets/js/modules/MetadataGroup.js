(function(xtens, MetadataGroup) {

    // dependencies
    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var MetadataComponent = xtens.module("metadatacomponent");
    var MetadataField = xtens.module("metadatafield");
    var MetadataLoop = xtens.module("metadataloop");


    // XTENS router alias
    var router = xtens.router;

    MetadataGroup.Model = Backbone.Model.extend({
        defaults: {
            label: Constants.METADATA_GROUP,
            name: null
        }
    });

    MetadataGroup.List = Backbone.Collection.extend({
        model: MetadataGroup.Model
    });

    MetadataGroup.Views.Edit = MetadataComponent.Views.Edit.fullExtend({

        // model: MetadataGroup.Model,

        tagName: 'div',
        className: 'metadataGroup',

        bindings: {
            'input[name=name]': 'name'
        },

        initialize: function() {
            this.template = JST["views/templates/metadatagroup-edit.ejs"];
            this.nestedViews = [];
        },

        events: {
            'click .add-metadata-field': 'addMetadataFieldOnClick',
            'click .add-metadata-loop': 'addMetadataLoopOnClick',
            'click .remove-me': 'closeMe'
        },

        addMetadataFieldOnClick: function(ev) {
            this.add({label: Constants.METADATA_FIELD});
            ev.stopPropagation();
        },

        addMetadataLoopOnClick: function(ev) {
            this.add({label: Constants.METADATA_LOOP});
            ev.stopPropagation();
        },

        add: function(subcomponent) {
            var model, view;
            switch (subcomponent.label) {
                case Constants.METADATA_FIELD:
                    model = new MetadataField.Model();
                    model.set(subcomponent);
                    view = new MetadataField.Views.Edit({model: model});
                    break;
                case Constants.METADATA_LOOP:
                    model = new MetadataLoop.Model();
                    model.set(subcomponent);
                    view = new MetadataLoop.Views.Edit({model: model});
                    break;
            }
            this.$('.metadataGroup-body').append(view.render(subcomponent).el);
            this.listenTo(view, 'closeMe', this.removeChild);
            this.nestedViews.push(view);
        }

    });

} (xtens, xtens.module("metadatagroup")));
