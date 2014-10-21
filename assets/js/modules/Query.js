(function(xtens, Query) {

    var i18n = xtens.module("i18n").en;
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;

    // constant to define the field-value HTML element
    var FIELD_VALUE = 'field-value';

    var checkboxTemplate = _.template("<div class='checkbox'><input type='checkbox'></div>");

    function QueryElementFactory() {}

    QueryElementFactory.prototype = {
    
        createCheckbox: function() {
            var template = _.template("<div class='checkbox'><input type='checkbox'></div>");
        },
        
        createListChoice: function(list) {
            var div = document.createElement("div");
            div.className = 'query-value-div';
            var selector = document.createElement("input");
            selector.type = 'hidden';
            selector.name = FIELD_VALUE;
            var data = list.map(function(elem) { return {"id":elem, "text":elem}; });
            div.appendChild(selector);
            return div;
        }


    };

    var factory = new QueryElementFactory();

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

        className: 'form-group',
        
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
                },
                getVal: function($el, ev, options) {
                    return _.findWhere(options.view.fieldList, {name: $el.val()});
                }

            }
        },
        
        initialize: function(options) {
            this.template = JST['views/templates/query-builder-row.ejs'];
            this.fieldList = options.fieldList;
            this.listenTo(this.model, 'change:fieldName', this.fieldNameOnChange);
        },

        render: function() {
            this.$el.html(this.template({ __: i18n}));
            this.stickit();
            this.$comparator = this.$("input[name=comparator]");
            this.$junction = this.$("input[name=junction]");
            return this;
        },

        fieldNameOnChange: function(model, selectedField) {
            this.$comparator.select2('destroy');
            this.$junction.select2('destroy');
            this.generateComparisonItem(selectedField);
            this.generateComparedValueItem(selectedField);
            this.generateJunctionItem();
            //this.generateComparedUnitItem(selectedField);
        },

        generateComparisonItem: function(metadataField) {
            var data = [], fieldType = metadataField.fieldType;
            if (fieldType === FieldTypes.BOOLEAN) {
                return;
            }
            if (fieldType === FieldTypes.INTEGER || fieldType === FieldTypes.FLOAT) {
                data = [ { id: '=', text: '=' }, { id: '<=', text: '≤' },
                         { id: '>=', text: '≥' }, { id: '<', text: '<' },
                         { id: '>', text: '>' }, { id: '<>', text: '≠' }];
            }
            else {
                data = [ { id: '=', text: '=' }, { id: '<>', text: '≠' }];
            }
            this.$comparator.select2({
               data: data 
            });
        },

        generateComparedValueItem: function(metadataField) {
            var data = [], fieldType = metadataField.fieldType;
            if (fieldType === FieldTypes.BOOLEAN) {
                this.appendComparedBoolean();
            }
            else if (metadataField.isList) {
                this.appendComparedValueList(metadataField.possibleValues);
            }
            else {
                this.appendTextInput();
            }
        },

        appendComparedBoolean: function() {
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("checkbox");
            var checkbox = document.createElement("input");
            checkbox.type = 'checkbox';
            checkbox.name = FIELD_VALUE;
            $container.append(checkbox);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", { 
                observe: 'fieldValue',
                getVal: function($el) {
                    return $el.prop('checked');
                }
            });
        },

        appendComparedValueList: function(list) {
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("query-value-div");
            var selector = document.createElement("input");
            selector.type = 'hidden';
            selector.name = FIELD_VALUE;
            selector.className = 'form-control';
            var data = list.map(function(elem) { return {"id":elem, "text":elem}; });
            $container.append(selector);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']",{ 
                observe: 'fieldValue',
                initialize: function($el) {
                    $el.select2({
                        data: data, 
                        placeholder: i18n("please-select")});
                }  
            });
        },

        appendTextInput: function(validationOpts) {
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("query-value-div");
            var textField = document.createElement("input");
            textField.type = 'text';
            textField.name = FIELD_VALUE;
            textField.className = 'form-control';
            $container.append(textField);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", {
                observe: 'findValue'
            });
        },

        generateJunctionItem: function() {
            var data = [ {id: 'AND', text: 'AND'}, {id: 'OR', text: 'OR'} ];
            this.$junction.select2({
                data: data
            });
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
            this.$addConditionButton = this.$("#add-condition");
            this.listenTo(this.model, 'change:pivotDataType', this.pivotDataTypeOnChange);

        },

        events: {
            'click #add-condition': 'addQueryRow'
        },

        addQueryRow: function() {
            var childView = new Query.Views.Row({fieldList: this.model.get('pivotDataType').getFlattenedFields(),
                                                model: new Query.RowModel()});
            this.$("#query-form").append(childView.render().el);
            this.add(childView);
        },

        pivotDataTypeOnChange: function(model, selectedDataType) {
            var len = this.nestedViews.length; 
            for(var i=0; i<len; i++){
                this.removeChild(this.nestedViews[i]);
            }
            if (!selectedDataType) {
               this.$addConditionButton.addClass('hidden');
                return;
            }
            this.$addConditionButton.removeClass('hidden');
            var childView = new Query.Views.Row({fieldList: selectedDataType.getFlattenedFields(), model: new Query.RowModel()});
            this.$("#query-form").append(childView.render().el);
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
