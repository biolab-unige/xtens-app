(function(xtens, PersonalDetails) {
    
    var i18n = xtens.module("i18n").en;

    PersonalDetails.Model = Backbone.Model.extend({});

    PersonalDetails.List = Backbone.Collection.extend({});

    PersonalDetails.Views.Edit = Backbone.View.extend({
        
        tagName: 'div',
        className: 'personalDetails',

        initialize: function(options) {
            this.template = JST["views/templates/personaldetails-edit.ejs"];
        },

        bindings: {
        
            '#givenName': 'givenName',
            '#surname': 'surname',
            '#birthDate': {
                observe: 'birthDate',

                // format date on model as ISO (YYYY-MM-DD)
                onSet: function(val, options) {
                    var dateArray = val.split("/");
                    return new Date(dateArray[2] + '-'+ dateArray[1] + '-' + dateArray[0]);
                },

                // store data in view (from model) as DD/MM/YYYY (European format)
                onGet: function(value, options) {
                    if (value) {
                        var dateArray = value instanceof Date ? value.toISOString().split('-') : value.split('-');
                        var dateArray2 = dateArray[2].split('T');
                        dateArray[2] = dateArray2[0];
                        return dateArray[2] + '/' + dateArray[1] + '/' + dateArray[0];
                    }
                },

                // initialize Pikaday + Moment.js
                initialize: function($el, model, options) {
                    var picker = new Pikaday({
                        field: $el[0],
                        format: 'DD/MM/YYYY',
                        minDate: moment('1900-01-01').toDate(),
                        maxDate: new Date()
                    });
                }
            }

        },

        render: function() {
            this.$el.html(this.template({__:i18n}));
            this.stickit();
            return this;
        }

    });

} (xtens, xtens.module("personaldetails")));
