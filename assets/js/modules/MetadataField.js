(function(xtens, MetadataField) {
    // Dependencies
    var constants = xtens.module("xtensconstants").Constants;
    var fieldTypes = xtens.module("xtensconstants").FieldTypes;
    var MetadataComponent = xtens.module("metadatacomponent");
    var i18n = xtens.module("i18n").en;

    /*
       function addChoiceToSelect2(term, data) {
       if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
       return {id:term, text:term};
       }
       } */
    function initializeSelect2Field($el, model, option) {
        var property =  $el.attr('name'); 
        if (_.isArray(model.get(property))) {
            var data =[];
            var list = model.get(property);
            for (i=0, len=list.length; i<len; i++) {
                data.push({id: list[i], text: list[i], locked: true});
            }
            $el.select2({
                multiple: true, 
                data: data,
                createSearchChoice: function(term, data) {
                    if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
                        return {id:term, text:term};
                    }
                },
                width: 'resolve'
            });
        }
    }

    MetadataField.Model = Backbone.Model.extend({

        defaults: {
            label: constants.METADATA_FIELD,
            name: null,
            ontologyUri: null,
            type: fieldTypes.TEXT,
            required: false,
            customValue: null,
            isList: false,
            possibleValues: null,
            hasUnit: false,
            possibleUnits: null
        },

        initialize: function() {

        },

    });

    MetadataField.Views.Edit = MetadataComponent.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'metadataField',

        bindings: {
            'select[name=fieldType]': {
                observe: 'fieldType',
                selectOptions: {
                    collection: function() {
                        var coll = [];
                        _.each(fieldTypes, function(value){
                            coll.push({label: value.toUpperCase(), value: value});
                        });
                        return coll;
                    }
                }
            },
            '[name=name]': 'name',
            '[name=customValue]': 'customValue',
            '[name=required]': {
                observe: 'required',
                getVal: function($el, ev, options) {
                    return $el.prop('checked');
                }
            },
            '[name=sensitive]': {
                observe: 'sensitive',
                getVal: function($el, ev, option) {
                    return $el.prop('checked');
                }
            },
            '[name=min]': 'min',
            '[name=max]': 'max',
            '[name=step]': 'step',
            '[name=isList]': {
                observe: 'isList',
                getVal: function($el, ev, option) {
                    return $el.prop('checked');
                }
            },
            '[name=hasUnit]': {
                observe: 'hasUnit',
                getVal: function($el, ev, option) {
                    return $el.prop('checked');
                }
            },
            '[name=fromDatabaseCollection]': {
                observe: 'fromDatabaseCollection',
                getVal: function($el, ev, option) {
                    return $el.prop('checked');
                }
            },
            '[name=possibleValues]': {
                observe: 'possibleValues',
                initialize: initializeSelect2Field,
                getVal: function($el, ev, option) {
                    return $el.val().split(",");
                }
            },
            '[name=possibleUnits]': {
                observe: 'possibleUnits',
                initialize: initializeSelect2Field,
                getVal: function($el, ev, option) {
                    return $el.val().split(",");
                }
            },
            'select[name=dbCollection]': {
                observe: 'dbCollection',
                collection: [],
                defaultOption: {
                    label: i18n('please-select'),
                    value: null
                }
            }
        },

        initialize: function(attrs) {
            this.options = attrs;
            this.template = JST['views/templates/metadatafield-edit.ejs'];
        },

        render: function(field) {
            this.$el.html(this.template({__: i18n, fieldTypes: fieldTypes, component: field}));
            if (field.name) {
               this.$('.no-edit').prop('disabled', true);
            }
            this.stickit();
            return this;
        },

        add: function(child) {
            return null;
        },

        events: {
            'change .field-type': 'onFieldTypeChange',
            'click .remove-me': 'closeMe',
            'click .add-value-to-list': 'addValueToList',
            'click .add-unit-to-list': 'addUnitToList',
            'change input[type=checkbox][name=isList]': 'isListOnChange',
            'change input[type=checkbox][name=hasUnit]': 'hasUnitOnChange',
            'change select.field-type': 'fieldTypeOnChange'
        },

        isListOnChange: function(ev) {
            $customValue = this.$('input[name=customValue]');
            $customValue.prop('disabled', true);
            $customValue.parent().hide();
            if ($(ev.target).is(':checked')) {
                this.$('.value-list').select2({
                    multiple: 'true',
                    tags: [],
                    width: 'resolve'
                });
            }
            else {
                this.$('.value-list').select2('destroy');
                this.$(".value-list").val("");
            }
        },

        hasUnitOnChange: function(ev) {
            if ($(ev.target).is(':checked')) {
                this.$('.unit-list').select2({
                    multiple: 'true',
                    tags: [],
                    width: 'resolve'
                });
            }
            else {
                this.$('.unit-list').select2('destroy');
                this.$(".unit-list").val("");
            }
        },

        fieldTypeOnChange: function(ev) {
            this.toggleNumericalRange($(ev.target).children('option:selected').val());
            ev.stopPropagation();
        },

        toggleNumericalRange: function(selectedValue) {
            if (selectedValue === fieldTypes.INTEGER || selectedValue === fieldTypes.FLOAT) {
                this.$('div.metadataField-range').show();            
            }
            else {
                var $range = this.$('.metadataField-range');
                $range.children('input').val('');
                $range.hide();
            }
        }
    });

    MetadataField.List = Backbone.Collection.extend({
        model: MetadataField.Model
    });

} (xtens, xtens.module("metadatafield")));
