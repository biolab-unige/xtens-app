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
                    // var dateArray = val.split("/");
                    var momentDate = moment(val, 'L', 'it');
                    // return new Date(dateArray[2] + '-'+ dateArray[1] + '-' + dateArray[0]);
                    return momentDate.format('YYYY-MM-DD');
                },

                // store data in view (from model) as DD/MM/YYYY (European format)
                onGet: function(value, options) {
                    if (value) {
                        /*
                        var dateArray = value instanceof Date ? value.toISOString().split('-') : moment(value).format('L');
                        var dateArray2 = dateArray[2].split('T');
                        dateArray[2] = dateArray2[0];
                        return dateArray[2] + '/' + dateArray[1] + '/' + dateArray[0]; */
                        return moment(value).lang("it").format('L');
                    }
                },

                // initialize Pikaday + Moment.js
                initialize: function($el, model, options) {
                    var picker = new Pikaday({
                        field: $el[0],
                        // lang: 'it',
                        // format: 'DD/MM/YYYY',
                        format: moment.localeData('it')._longDateFormat.L,
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

    PersonalDetails.Views.Details = Backbone.View.extend({
        tagName: 'div',
        className: 'personalDetails',

        /**
         * @extends Backbone.View.initialize
         */
        initialize: function(options) {

          this.template = JST["views/templates/personaldetails-details.ejs"];
          // var filename= this.getFileName(this.model);
          //  this.model.set("filename", filename);

        },

        render: function() {
            this.$el.html(this.template({__:i18n}));
            this.stickit();
            return this;
        },

        bindings: {

            '#givenName': 'givenName',
            '#surname': 'surname',
            '#birthDate': {
                observe: 'birthDate',

                // store data in view (from model) as DD/MM/YYYY (European format)
                onGet: function(value, options) {
                    if (value) {
                        /*
                        var dateArray = value instanceof Date ? value.toISOString().split('-') : moment(value).format('L');
                        var dateArray2 = dateArray[2].split('T');
                        dateArray[2] = dateArray2[0];
                        return dateArray[2] + '/' + dateArray[1] + '/' + dateArray[0]; */
                        return moment(value).lang("it").format('L');
                        }
                      }
                    }
                  }
          });


} (xtens, xtens.module("personaldetails")));
