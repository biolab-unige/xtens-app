(function(xtens, Query) {

    var i18n = xtens.module("i18n").en;

    Query.Model = Backbone.Model.extend({
        urlRoot: 'query'
    });

    Query.Views.Component = Backbone.View.extend({

        add: function(child) {
            this.nestedViews.push(child);
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
        }



    });

    Query.RowModel = Backbone.Model.extend({});

    Query.Views.Row = Query.Views.Component.fullExtend({
        
        bindings: {
            '[name="field-name"]': {
                observe: 'fieldName',
                initialize: function($el) {
                    $el.select2({placeholder: i18n("please-select")});
                },
                selectOptions: {
                    collection: 'this.fieldList',
                    labelPath: 'name',
                    valuePath: 'name',
                    defaultOption: {
                        label: "",
                        value: null
                    }
                }

            }
        },
        
        initialize: function(options){
            this.template = JST['views/templates/query-builder-row.ejs'];
            this.fieldList = options.fieldList;
        },

        render: function(){
            this.$el.html(this.template({ __: i18n}));
            this.stickit();
            return this;
        }
    });


    Query.Views.Builder = Query.Views.Component.fullExtend({

        className: 'query',

        bindings: {
            '#pivot-data-type': {
                observe: 'pivotDataType',
                initialize: function($el) {
                    $el.select2({placeholder: i18n('please-select')});
                },
                selectOptions: {
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
                    }
                },
                getVal: function($el, ev, options) {
                    return _.findWhere(options.view.dataTypes, {id: parseInt($el.val())});
                }
            } 
        },

        initialize: function(options) {
            this.template = JST["views/templates/query-builder.ejs"];
            $('#main').html(this.el);
            this.nestedViews = [];
            this.dataTypes = options.dataTypes || [];
            this.render(options);
            this.listenTo(this.model, 'change:pivotDataType', this.pivotDataTypeOnChange);

        },

        pivotDataTypeOnChange: function(model, selectedDataType){
            var len = this.nestedViews.length; 
            for(var i=0; i<len; i++){
                this.removeChild(this.nestedViews[i]);
            }
            var childView = new Query.Views.Row({fieldList: selectedDataType.getFlattenedFields(), model: new Query.RowModel()});
            this.$el.append(childView.render().el);
            this.add(childView);

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
