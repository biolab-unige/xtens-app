(function(xtens, Operator) {
    
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

    // define an Operator
    Operator.Model = Backbone.Model.extend({

        urlRoot: '/operator',

        initialize: function() {
            // add a nested MetadataField collection
            this.set({ metadataFields: new MetadataField.List() });
        }
    });

    Operator.List = Backbone.Collection.extend({
        url: '/operator',
        model: Operator.Model
    });

    /**
     * This is the view to create/edit the DataType
     */

    Operator.Views.Edit = Backbone.View.extend({
        el: $("#main"),

        initialize: function() {
            this.template = JST["views/templates/operator-edit.ejs"]; 
        },

        render: function(options) {
            this.$el.html(this.template({__: i18n}));
            return this;
        },

        events: {
            'submit .edit-operator-form': 'saveOperator',
             
        },

        saveOperator: function() {
            var operatorDetails = $(ev.currentTarget).serializeObject();
            operatorDetails = { name: operatorDetails.name, schema: {"pippo": "franco"} };
            var operator = new Operator.Model();
            operator.save(operatorDetails, {
                success: function(operator) {
                    router.navigate('operator', {trigger: true});
                }
            });
            return false;
        },

    });

	
    Operator.Views.List = Backbone.View.extend({
        el: $("#main"),

        initialize: function() {
            this.template = JST["views/templates/operator-list.ejs"];
        },

        render: function(options) {

            var self = this;
            var operator = new Operator.List();
            operator.fetch({
                success: function(operator) {
                    self.$el.html(self.template({__: i18n, operator: operator.models}));
                    return self;
                },
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                    return self;    
                }

            });

        }
    });
} (xtens, xtens.module("operator")));
