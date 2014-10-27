(function(xtens, Query) {

    var i18n = xtens.module("i18n").en;
    var FieldTypes = xtens.module("xtensconstants").FieldTypes;
    var QueryStrategy = xtens.module("querystrategy");
    var Data = xtens.module("data");

    // constant to define the field-value HTML element
    var FIELD_VALUE = 'field-value';

    var checkboxTemplate = _.template("<div class='checkbox'><input type='checkbox'></div>");

    Query.Model = Backbone.Model.extend({
        urlRoot: 'query'
    });

    // TODO: refactor this class together with MetadataComponent class
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
            this.$unit = this.$("input[name=unit]");
            this.$junction = this.$("input[name=junction]");
            return this;
        },

        fieldNameOnChange: function(model, fieldName) {
            this.$("input[type=hidden]").select2('destroy');
            var selectedField = _.findWhere(this.fieldList, {name: fieldName});
            this.model.set("fieldType", selectedField.fieldType.toLowerCase());
            this.model.set("isList", selectedField.isList);
            this.generateComparisonItem(selectedField);
            this.generateComparedValueItem(selectedField);
            if (selectedField.hasUnit && selectedField.possibleUnits) {
                this.generateComparedUnitItem(selectedField.possibleUnits);
            }
            this.generateJunctionItem();
        },

        generateComparisonItem: function(metadataField) {
            var data = [], fieldType = metadataField.fieldType;
            if (fieldType === FieldTypes.BOOLEAN) {
                return;
            }
            if (metadataField.isList) {
                data = [ { id: 'IN', text: '=' }, { id: 'NOT IN', text: '≠' }];
            }
            else if (fieldType === FieldTypes.INTEGER || fieldType === FieldTypes.FLOAT) {
                data = [ { id: '=', text: '=' }, { id: '<=', text: '≤' },
                    { id: '>=', text: '≥' }, { id: '<', text: '<' },
                    { id: '>', text: '>' }, { id: '<>', text: '≠' }];
            }
            else {
                data = [ { id: '=', text: '=' }, { id: '<>', text: '≠' }];
            }
            this.addBinding(null, 'input[name=comparator]', {
                observe: 'comparator',
                initialize: function($el) {
                    $el.select2({
                        data: data 
                    });
                }
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
            var $container = this.$("[name='query-value-div']").empty().removeClass().addClass("query-value-div");
            var selector = document.createElement("input");
            selector.type = 'hidden';
            selector.className = 'form-control';
            selector.name = FIELD_VALUE;
            $container.append(selector);
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", { 
                observe: 'fieldValue',
                initialize: function($el) {
                    $el.select2({
                        data: [{id: true, text: i18n('yes')}, {id: false, text: i18n('no')}]
                    });
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
            this.addBinding(null, "input[name='"+FIELD_VALUE+"']", { 
                observe: 'fieldValue',
                initialize: function($el) {
                    $el.select2({
                        multiple: true,
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
                observe: 'fieldValue'
            });
        },

        generateComparedUnitItem:function(possibleUnits) {
            var data = possibleUnits.map(function(unit) {
                return { id: unit, text: unit };
            });
            this.addBinding(null, "input[name='unit']", { 
                observe: 'fieldUnit',
                initialize: function($el) {
                    $el.select2({
                        data: data, 
                        placeholder: i18n("please-select")});
                }  
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
                    return parseInt($el.val());
                }
            } 
        },

        initialize: function(options) {
            this.template = JST["views/templates/query-builder.ejs"];
            $('#main').html(this.el);
            this.nestedViews = [];
            this.dataTypes = options.dataTypes || [];
            this.queryStrategy = new QueryStrategy.PostgresJSON();
            this.render(options);
            this.$addConditionButton = this.$("#add-condition");
            this.listenTo(this.model, 'change:pivotDataType', this.pivotDataTypeOnChange);

        },

        events: {
            'click #add-condition': 'addQueryRow',
            'click #search': 'sendQuery'
        },

        addQueryRow: function() {
            var childView = new Query.Views.Row({fieldList: this.model.get('pivotDataType').getFlattenedFields(),
                                                model: new Query.RowModel()});
                                                this.$("#query-form").append(childView.render().el);
                                                this.add(childView);
        },

        pivotDataTypeOnChange: function(model, idDataType) {
            this.clear();
            if (!idDataType) {
                this.$addConditionButton.addClass('hidden');
                return;
            }
            var selectedDataType = _.findWhere(this.dataTypes, {id: idDataType});
            this.$addConditionButton.removeClass('hidden');
            var childView = new Query.Views.Row({fieldList: selectedDataType.getFlattenedFields(), model: new Query.RowModel()});
            this.$("#query-form").append(childView.render().el);
            this.add(childView);

        },

        clear: function() {
            var len = this.nestedViews.length; 
            for(var i=len-1; i>=0; i--) {
                this.removeChild(this.nestedViews[i]);
            }
        },

        render: function(options) {
            if (options.id) {} // load an existing query TODO
            else {
                this.$el.html(this.template({__: i18n }));
                this.stickit();
            }
            return this;
        },

        sendQuery: function() {
            var queryParameters = JSON.stringify({queryArgs: this.serialize()});
            $.ajax({
                method: 'POST',
                contentType: 'application/json;charset:utf-8',
                url: '/query/dataSearch',
                data: queryParameters,
                success: function(data) {
                    var dataList = new Data.List(data);
                    console.log(dataList);
                },
                error: function(jqXHR, textStatus, err) {
                    alert(err);
                }

            });
            return false;
            /* .done(function(data) {
                var dataList = new Data.List(data);
                console.log(dataList);
            }).fail(function(err) {
                alert(err);
            }).always(function() {
                console.log('complete!');
            }); */
        }

    });

} (xtens, xtens.module("query")));
