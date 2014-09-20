(function(xtens, DataType) {

    // dependencies
    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var MetadataGroup = xtens.module("metadatagroup"); 

    // XTENS router alias
    var router = xtens.router;   

    /**
     * Serialize a form element as a metadata field view
     */
    function serializeAsMetadataField(element) {
        var $element = $(element);
        var fieldJson = _.extend({label: Constants.METADATA_FIELD}, $element.find("select, input, textarea").serializeObject());
        // fieldJson.label = Constants.METADATA_FIELD;
        fieldJson.required = fieldJson.required ? true : false;
        fieldJson.isList = fieldJson.isList ? true : false;
        fieldJson.possibleValues = _.isEmpty(fieldJson.possibleValues) ? [] : fieldJson.possibleValues.split(',');
        fieldJson.hasUnits = fieldJson.hasUnits ? true : false;
        fieldJson.possibleUnits = _.isEmpty(fieldJson.possibleUnits) ? [] : fieldJson.possibleUnits.split(",");
        fieldJson.fromDatabaseCollection = fieldJson.fromDatabaseCollection ? true : false;
        return fieldJson;
    }

    /**
     *  define a DataType model
     */
    DataType.Model = Backbone.Model.extend({

        urlRoot: '/dataType',

        initialize: function() {
            // add a nested MetadataField collection
            // this.set({ metadataFields: new MetadataField.List() });
        }
    });

    DataType.List = Backbone.Collection.extend({
        url: '/dataType',
        model: DataType.Model
    });

    /**
     * This is the view to create/edit the DataType
     */

    DataType.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'dataType',

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-edit.ejs"];
            this.nestedViews = [];
            this.render(options);
        },

        render: function(options) {
            if (options.id) {
                this.dataType = new DataType.Model({id: options.id});
                this.dataType.fetch({
                    success: this.fetchSuccess
                });
            } else {
                this.$el.html(this.template({__: i18n, dataType: null}));
            }
            return this;
        },

        fetchSuccess: function(dataType) {
            this.$el.html(this.template({__: i18n, dataType: dataType}));
            var body = dataType.get('schema').body;
            for (var i=0, len=body.length; i<len; i++) {
                this.addMetadataGroup(body[i]);
            }
        },

        events: {
            'submit .edit-datatype-form': 'saveDataType',
            'click .add-metadata-group': 'addMetadataGroupOnClick'    // not used yet 
        },

        serializeMetadataBody: function() {
            var metadataBody = [];
            this.$('.metadataGroup').each(function(metadataGroupIndex, metadataGroupElement) {
                var $metadataGroupElement = $(metadataGroupElement);
                var groupJson = {label: Constants.METADATA_GROUP, name: $metadataGroupElement.find('input[name="name"]').val(), content: [] };
                $metadataGroupElement.find('.metadataGroup-body').children().each(function(metadataComponentIndex, metadataComponentElement) {
                    if ($(metadataComponentElement).hasClass('metadataField')) {
                        groupJson.content.push(serializeAsMetadataField(metadataComponentElement));
                    }
                    else if ($(metadataComponentElement).hasClass('metadataLoop')) {
                        var loopJson = {label: Constants.METADATA_LOOP, content: []};
                        $(metadataComponentElement).find('.metadataLoop-body').children().each(function(metadataFieldIndex, metadataFieldElement) {
                            loopJson.content.push(serializeAsMetadataField(metadataFieldElement));
                        });
                        groupJson.content.push(loopJson);
                    } 
                });
                metadataBody.push(groupJson);
            });
            return metadataBody;
        },

        saveDataType: function(ev) {
            var id = $('#id').val();
            var header = this.$("#schemaHeader").find("select, input, textarea").serializeObject();
            header.fileUpload = header.fileUpload ? true : false;
            var body = this.serializeMetadataBody();
            var dataTypeDetails = { id: id, name: header.schemaName, schema: {header: header, body: body} };
            var dataType = new DataType.Model();
            dataType.save(dataTypeDetails, {
                // patch: true,
                success: function(dataType) {
                    console.log(dataType);
                    router.navigate('datatypes', {trigger: true});
                },
                error: function() {
                    console.log("Error saving the DataType");
                }
            });
            return false;
        },

        addMetadataGroupOnClick: function(ev) {
            this.addMetadataGroup(null);
            ev.stopPropagation();
        },

        addMetadataGroup: function(group) {
            var view = new MetadataGroup.Views.Edit();
            this.$("#schemaBody").append(view.render(group).el);
            this.nestedViews.push(view);
        }

    });

    /**
     *  This is the view to show in a table the full list of existing datatypes
     */
    DataType.Views.List = Backbone.View.extend({
        tagName: 'div',
        className: 'dataTypes',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-list.ejs"];
            this.render();
        },

        render: function(options) {

            var self = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({
                success: function(dataTypes) {
                    self.$el.html(self.template({__: i18n, dataTypes: dataTypes.models}));
                },
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                }

            });
            return this;
        }
    });
} (xtens, xtens.module("datatype")));

