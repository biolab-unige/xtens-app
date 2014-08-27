(function(xtens, DataType) {
    
    // jQuery serializeObject plugin - to be moved in a separate module (by Massi)
     $.fn.serializeObject = function() {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
          if (o[this.name] !== undefined) {
              if (!o[this.name].push) {
                  o[this.name] = [o[this.name]];
              }
              o[this.name].push(this.value || '');
          } else {
              o[this.name] = this.value || '';
          }
      });
      return o;
    };

    // dependencies
    var i18n = xtens.module("i18n").en;
    var MetadataField = xtens.module("metadatafield");    

    // define a DataType
    DataType.Model = Backbone.Model.extend({

        urlRoot: '/dataType',

        initialize: function() {
            // add a nested MetadataField collection
            this.set({ metadataFields: new MetadataField.List() });
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
        el: $("#main"),

        initialize: function() {
            this.template = JST["views/templates/datatype-edit.ejs"]; 
        },

        render: function(options) {
            this.$el.html(this.template({__: i18n}));
            return this;
        },

        events: {
            'submit .edit-datatype-form': 'saveDataType',
            'click .btn-primary': 'addMetadataField'    // not used yet 
        },

        saveDataType: function() {
            var dataTypeDetails = $(ev.currentTarget).serializeObject();
            dataTypeDetails = { name: dataTypeDetails.name, schema: {"pippo": "franco"} };
            var dataType = new DataType.Model();
            dataType.save(dataTypeDetails, {
                success: function(dataType) {
                    router.navigate('datatypes', {trigger: true});
                }
            });
            return false;
        },

        addMetadataField: function() {
            var metadataField = new MetadataField.Model();
            var metadataFieldView = new MetadataField.View({model: metadataField});
            this.$el.append(metadataFieldView.render());
        }   
    });

    /**
     *  This is the view to show in a table the full list of existing datatypes
     */
    DataType.Views.List = Backbone.View.extend({
        el: $("#main"),

        initialize: function() {
            this.template = JST["views/templates/datatype-list.ejs"];
        },

        render: function(options) {

            var self = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({
                success: function(dataTypes) {
                    self.$el.html(self.template({__: i18n, dataTypes: dataTypes.models}));
                    return self;
                },
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                    return self;    
                }

            });

        }
    });
} (xtens, xtens.module("datatype")));

