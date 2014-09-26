(function(xtens, MetadataComponent) {

    var i18n = xtens.module("i18n").en;

    MetadataComponent.Views.Edit = Backbone.View.extend({

        initialize: function() {
            this.template = null;   // no template implemented at this stage
        },

        render: function() {
            var component = _.clone(this.model.attributes); 
            this.$el.html(this.template({ __: i18n, component: component }));
            this.stickit();
            if (_.isArray(component.content)) {
                var content = component.content;
                for (var i=0, len=content.length; i<len; i++) {
                    this.add(content[i]);
                }
            }
            return this;
        },

        add: function(child) {
            return null;
        },

        removeChild: function(child) {
            for (var i=0, len = this.nestedViews.length; i<len; i++) {
                if (_.isEqual(this.nestedViews[i], child)) {
                    child.remove();
                    if (child.nestedViews) {
                        for (var j=0, clen=child.nestedViews.length; j<clen; j++) {
                            if (child.nestedViews[j].remove) {
                                child.nestedViews[j].remove();
                            }
                        }
                    }
                    this.nestedViews.splice(i, 1);
                }
            }
        },

        getChild: function(i) {
            if (this.nestedViews) {
                return this.nestedViews[i];
            }
            return null;
        },

        closeMe: function(ev) {
            this.trigger('closeMe', this);
        },

        serialize: function() {
            var res = _.clone(this.model.attributes);
            if (_.isArray(this.nestedViews)) {
                res.content = [];
                for (var i=0, len=this.nestedViews.length; i<len; i++) {
                    res.content.push(this.nestedViews[i].serialize());
                }
            }
            return res;
        },

    });
    
    /*
    MetadataComponent.Views.Form = Backbone.View.extend({
        
        initialize: function() {
            this.template = null;   // no template implemented at this stage
        },

        render: function() {}

    }); */

} (xtens, xtens.module("metadatacomponent")));
