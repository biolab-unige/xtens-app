(function(xtens, MetadataField) {
    // Dependencies
    var constants = xtens.module("xtensconstants").Constants;
    var fieldTypes = xtens.module("xtensconstants").FieldTypes;
    var MetadataComponent = xtens.module("metadatacomponent");
    var i18n = xtens.module("i18n").en;

    // var metadataFieldNameNotAllowedCharset = /[^A-Za-z_][^A-Za-z_0-9]*/g;
    var metadataFieldNameNotAllowedCharset = /[^A-Za-z_0-9:]/g;

    /*
       function addChoiceToSelect2(term, data) {
       if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
       return {id:term, text:term};
       }
       } */

    /**
     * @method
     * @name initializeSelect2Field
     */
    function initializeSelect2Field($el, model, option) {
        var property =  $el.attr('name');
        if (_.isArray(model.get(property))) {
            var data =[];
            var list = model.get(property);
            for (i=0, len=list.length; i<len; i++) {
                data.push({id: list[i], text: list[i], locked: false}); // set locked to false to edit values/unit list options
            }
            $el.select2({
                multiple: true,
                data: data,
                createSearchChoice: function(term, data) {
                    if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
                        return {id:term, text:term};
                    }
                },
                tokenSeparators: [','],
                width: 'resolve'
            });
        }
    }

    function initializeCaseInsensitive($el, model, option) {
        if (model.get("fieldType") !== fieldTypes.TEXT || model.get("isList")) {
            $el.parent().hide();
        }
    }

    function initializeRange($el, model, option) {
        if (!model.isNumeric()) {
            $el.parent().hide();
        }
    }

    function initializeRangeInput($el, model, option) {
        if (model.hasRange) {
            $el.parent().show();
        }
    }

    MetadataField.Model = Backbone.Model.extend({

        defaults: {
            label: constants.METADATA_FIELD,
            fieldType: fieldTypes.TEXT,
            name: null,
            ontologyUri: null,
            customValue: null,
            visible: true,
            caseInsensitive: false,
            required: false,
            sensitive: false,
            hasRange: false,
            isList: false,
            possibleValues: null,
            hasUnit: false,
            possibleUnits: null,
            description: null
        },

        initialize: function() {

        },

        isNumeric: function() {
            var type = this.get("fieldType");
            return (type === fieldTypes.INTEGER || type === fieldTypes.FLOAT);
        },

        /**
         * @method
         * @name formatName
         * @description format the metadata field name in order to make it a valid JavaScript property name
         *              for dot notation
         */
        formatName: function() {
            var name = this.get("name");

            // if name starts with digit add a dollar char ($) at the beginning
            if (/^\d/.test(name)) {
                name = "_" + name;
            }

            // replace with underscore all the not allowed charsets
            // (all the chars that  cannot be used in Javascript property names with dot notation)
            name = name.toLowerCase().replace(metadataFieldNameNotAllowedCharset, "_");

            // console.log(name);
            // set the formatted name in the metadata field
            this.set("formattedName", name);
        }

    });

    /**
     * @class
     * @name MetadataField.Views.Edit
     * @extends MetadataComponent.Views.Edit
     */
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
            '[name=custom-value]': 'customValue',
            '[name=visible]': {
                observe: 'visible',
                getVal: function($el, ev, options) {
                    return $el.prop('checked');
                }
            },
            '[name=caseInsensitive]': {
                observe: 'caseInsensitive',
                getVal: function($el, ev, options) {
                    return $el.prop('checked');
                },
                initialize: initializeCaseInsensitive
            },
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
            '[name=hasRange]': {
                observe: 'hasRange',
                getVal: function($el, ev, option) {
                    return $el.prop('checked');
                },
                initialize: initializeRange
            },
            '[name=min]': {
                observe: 'min',
                initialize: initializeRangeInput
            },
            '[name=max]': {
                observe: 'max',
                initialize: initializeRangeInput
            },
            '[name=step]': {
                observe: 'step',
                initialize: initializeRangeInput
            },
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
                initialize: function($el, model, option) {
                    if (!model.get("fromDatabaseCollection")) {
                        $el.parent().hide();
                    }
                },
                selectOptions: {
                    collection: function() {
                        return ["SNOMED CT"];
                    }
                },
                defaultOption: {
                    label: i18n('please-select'),
                    value: null
                }
            },
            '[name=description]': 'description'
        },

        initialize: function(attrs) {
            this.template = JST['views/templates/metadatafield-edit.ejs'];
        },

        render: function() {
            var field = _.clone(this.model.attributes);
            this.$el.html(this.template({__: i18n, fieldTypes: fieldTypes, component: field}));
            if (field.name) {
                // this.$('.no-edit').prop('disabled', true); /* disables all the fields I don't want to be edited (for consistency) */
            }
            this.stickit();
            this.listenTo(this.model, 'change:fieldType', this.fieldTypeOnChange);
            this.listenTo(this.model, 'change:hasRange', this.toggleRangeInputs);
            this.listenTo(this.model, 'change:isList', this.isListOnChange);
            this.listenTo(this.model, 'change:hasUnit', this.hasUnitOnChange);
            this.listenTo(this.model, 'change:fromDatabaseCollection', this.fromDatabaseCollectionOnChange);
            return this;
        },

        add: function(child) {
            return null;
        },

        /**
         * @method
         * @name serialize
         * @extends MetadataComponent.Views.Edit.serialize
         */
        serialize: function() {
            // store the formatted name
            this.model.formatName();
            return _.clone(this.model.attributes);
        },

        events: {
            'click .remove-me': 'closeMe'
        },

        isListOnChange: function() {
            var $customValue = this.$('input[name=customValue]');
            if (this.model.get("isList")) {
                $customValue.prop('disabled', true);
                $customValue.parent().hide();
                this.$('.value-list').select2({
                    multiple: 'true',
                    tags: [],
                    width: 'resolve'
                });
            }
            else {
                $customValue.prop('disabled', false);
                $customValue.parent().show();
                this.$('.value-list').select2('destroy');
                this.$(".value-list").val("");
            }
            this.toggleCaseInsensitiveCheckbox();
        },

        hasUnitOnChange: function() {
            if (this.model.get("hasUnit")) {
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

        fromDatabaseCollectionOnChange: function() {
            if (this.model.get("fromDatabaseCollection")) {
                this.$('select[name=dbCollection]').parent().show();
            }
            else {
                this.$('select[name=dbCollection]').parent().hide();
            }
        },

        /**
         * @method
         * @name fieldTypeOnChange
         * @description toggle additional HTML elements in view if field Type is changing
         */
        fieldTypeOnChange: function() {
            if (this.model.isNumeric()) {
                this.$('input[name=hasRange]').parent().show();
            }
            else {
                this.$('input[name=hasRange]').parent().hide();
            }
            this.toggleCaseInsensitiveCheckbox();
        },

        toggleCaseInsensitiveCheckbox: function() {
            if (this.model.get('fieldType') === fieldTypes.TEXT && !this.model.get("isList")) {
                this.$('input[name=caseInsensitive]').parent().show();
            }
            else {
                this.$('input[name=caseInsensitive]').parent().hide();
            }
        },

        toggleRangeInputs: function() {
            if (this.model.get('hasRange')) {
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
