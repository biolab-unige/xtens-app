(function(xtens, Query) {
    
    var i18n = xtens.module("i18n").en;

    Query.Model = Backbone.Model.extend({
        urlRoot: 'query'
    });

    Query.Views.Builder = Backbone.View.extend({

        className: 'query',
        
        bindings: {
            '#pivot-data-type': {
                observe: 'pivotDataType',
                collection: function() {
                    return this.dataTypes.map(function(dataType) {
                        return {
                            label: dataType.get("name"),
                            value: dataType.id
                        };
                    });
                },
                defaultOption: {
                    label: "",
                    value: null
                },
                initialize: function($el) {
                    $el.select2({placeholder: i18n('please-select')});
                },
            } 
        },

        initialize: function(options) {
            this.template = JST["views/templates/query-builder.ejs"];
            $('#main').html(this.el);
            this.dataTypes = options.dataTypes || [];
            this.render(options);

        },
        

        render: function(options) {
            if (options.id) {} // load an existing query TODO
            else {
                this.$el.html(this.template({__: i18n }));
                this.stickit();
            }
            return this;
        }

    });

} (xtens, xtens.module("query")));
