(function(xtens, MetadataField) {
    // Dependencies
    var constants = xtens.module("xtensconstants").Constants;
    var fieldTypes = xtens.module("xtensconstants").FieldTypes;
    var MetadataComponent = xtens.module("metadatacomponent");
    var i18n = xtens.module("i18n").en;

    function addChoiceToSelect2(term, data) {
        if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
            return {id:term, text:term};
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
            range: null
        },

        initialize: function() {

        },

    });

    MetadataField.Views.Edit = MetadataComponent.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'metadataField',

        // template: _.template($("#metadata-field-form-template").html()),
        initialize: function(attrs) {
            this.options = attrs;
            this.template = JST['views/templates/metadatafield-edit.ejs'];
        },

        render: function(field) {
            this.$el.html(this.template({__: i18n, fieldTypes: fieldTypes, component: field}));
            var i=0, len=0;
            if (this.$('input[type=checkbox][name=isList]').prop('checked')) {
                var valueData = [];
                for (i=0, len=field.possibleValues.length; i<len; i++) {
                    valueData.push({id:field.possibleValues[i], text: field.possibleValues[i], locked: true});
                }
                this.$(".value-list").select2({multiple: true, 
                                              data: valueData,
                                              createSearchChoice: function(term, data) {
                                                  if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
                                                      return {id:term, text:term};
                                                  }
                                              },
                                              width: 'resolve'
                });
            }
            if (this.$('input[type=checkbox][name=hasUnit]').prop('checked')) {
                var unitData = [];
                for (i=0, len=field.possibleUnits.length; i<len; i++) {
                    unitData.push({id:field.possibleUnits[i], text: field.possibleUnits[i], locked: true});
                }
                this.$(".unit-list").select2({multiple: true, 
                                             data: unitData,
                                             createSearchChoice: function(term, data) {
                                                if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
                                                      return {id:term, text:term};
                                                }
                                             },
                                             width: 'resolve'
                });
            }
            this.toggleNumericalRange(this.$('select.field-type').children('option:selected').val());
            return this;
        },

        events: {
            'change .field-type': 'onFieldTypeChange',
            'click .remove-me': 'removeMe',
            'click .add-value-to-list': 'addValueToList',
            'click .add-unit-to-list': 'addUnitToList',
            'change input[type=checkbox][name=isList]': 'isListOnChange',
            'change input[type=checkbox][name=hasUnit]': 'hasUnitOnChange',
            'change select.field-type': 'fieldTypeOnChange'
        },

        addValueToList: function(ev) {
            var value = this.$("input.value-to-add").val();
            var exists = false;
            this.$("select.value-list option").each(function() {
                if (this.value === value) {
                    exists = true;
                    return false;
                }
            });
            if (!exists) {
                this.$("select.value-list").append($("<option>").attr("value", value).html(value));
            }
            this.$("input.value-to-add").val("");
        },

        addUnitToList: function(ev) {
            var unit = this.$("input.unit-to-add").val();
            var exists = false;
            this.$("select.unit-list option").each(function() {
                if (this.value === unit) {
                    exists = true;
                    return false;
                }
            });
            if (!exists) {
                this.$("select.unit-list").append($("<option>").attr("value", unit).html(unit));
            }
            this.$("input.unit-to-add").val("");
        },

        isListOnChange: function(ev) {
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
