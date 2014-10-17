/**
 * @author  Massimiliano Izzo
 * @description This file conatains the Backbone classes for handling DataType
 *              models, collections and views  
 */
(function(xtens, DataType) {

    // dependencies
    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var DataTypeClasses = xtens.module("xtensconstants").DataTypeClasses;
    var MetadataComponent = xtens.module("metadatacomponent");
    var MetadataGroup = xtens.module("metadatagroup"); 

    // XTENS router alias
    var router = xtens.router;   

    /**
     *  define a DataType model
     */
    DataType.Model = Backbone.Model.extend({

        urlRoot: '/dataType',

        defaults: {
            classTemplate: DataTypeClasses.GENERIC
        },

        /**
         * @description flattens the metadata schema returning a 1D array containing all the metadata fields
         */
        getFlattenedFields: function() {
            var flattened = [];
            var body = this.get("schema") && this.get("schema").body;
            for (var i=0, len=body.length; i<len; i++){
                var groupContent = body[i] && body[i].content;
                for (var j=0, l=groupContent.length; j<l; j++) {
                    if (groupContent[j].label === Constants.METADATA_FIELD) {
                        flattened.push(groupContent[j]);
                    }
                    else if (groupContent[j].label === Constants.METADATA_LOOP) {
                        var loopContent = groupContent[j] && groupContent[j].content;
                        for (var k=0; k<loopContent.length; k++) {
                            if (loopContent[k].label === Constants.METADATA_FIELD) {
                                flattened.push(loopContent[k]);
                            }
                        }
                    }

                }
            }
            return flattened;
        }

        /*
initialize: function() {
this.set("className", DataTypeClasses.GENERIC);
} */
    });

    DataType.List = Backbone.Collection.extend({
        url: '/dataType',
        model: DataType.Model
    });

/**
 * This is the view to create/edit the DataType
 */

    DataType.Views.Edit = MetadataComponent.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'dataType',

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-edit.ejs"];
            this.nestedViews = [];
            this.existingDataTypes = options.dataTypes;
            this.render(options);
        },

        bindings: {
            '#schemaName': {
                observe: 'name'
            },
            '#classTemplate': {
                observe: 'classTemplate',
                selectOptions: {
                    collection: function() {
                        var coll = [];
                        _.each(DataTypeClasses, function(value){
                            coll.push({label: value.toUpperCase(), value: value});
                        });
                        return coll;
                    }   
                }
            },
            '#parent': {
                observe: 'parent',
                selectOptions: {
                    collection: 'this.existingDataTypes',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: i18n('please-select'),
                        value: null
                    }
                }
            }
        },

        render: function(options) {
            if (options.id) {
                this.model = new DataType.Model({id: options.id});
                this.model.fetch({
                    success: this.fetchSuccess
                });
            } else {
                this.$el.html(this.template({__: i18n, dataType: null}));
                this.stickit();
            }
            return this;
        },

        fetchSuccess: function(dataType) {
            this.$el.html(this.template({__: i18n, dataType: dataType}));
            this.stickit();
            var body = dataType.get('schema').body;
            for (var i=0, len=body.length; i<len; i++) {
                this.add(body[i]);
            }
        },

        events: {
            'submit .edit-datatype-form': 'saveDataType',
            'click .add-metadata-group': 'addMetadataGroupOnClick'    // not used yet 
        },

        serialize: function() {
            var metadataBody = [];
            for (var i=0, len=this.nestedViews.length; i<len; i++) {
                metadataBody.push(this.nestedViews[i].serialize()); 
            }
            return metadataBody;
        },

        saveDataType: function(ev) {
            var id = $('#id').val();
            var header = this.$("#schemaHeader").find("select, input, textarea").serializeObject();
            header.fileUpload = header.fileUpload ? true : false;
            var body = this.serialize();
            var dataTypeDetails = { id: id, name: header.schemaName, schema: {header: header, body: body} };
            //var dataType = new DataType.Model();
            this.model.save(dataTypeDetails, {
                //  patch: true,
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
            this.add({label: Constants.METADATA_GROUP});
            ev.stopPropagation();
        },

        add: function(group) {
            var model = new MetadataGroup.Model();
            model.set(group);
            var view = new MetadataGroup.Views.Edit({model: model});
            this.$("#schemaBody").append(view.render().el);
            this.listenTo(view, 'closeMe', this.removeChild);
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
            var that = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({
                success: function(dataTypes) {
                    that.$el.html(that.template({__: i18n, dataTypes: dataTypes.models}));
                },
                error: function() {
                    that.$el.html(that.template({__: i18n}));
                }
            });
            return this;
        }
    });

/**
 *  This is the view to show the form generated from the selected DataType
 *
 DataType.Views.Form = MetadataComponent.Views.Form.fullExtend({

tagName: div,
className: '.dataForm', 

}); */

} (xtens, xtens.module("datatype")));

