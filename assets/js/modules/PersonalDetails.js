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
            '#birthDate': 'birthDate',
            /** SEX moved to the subject interface
            '#sex': {
                observe: 'sex',
                selectOptions: {
                    collection: function() {
                        var res = [];
                        _.each(sexOptions, function(sexOption) {
                            res.push({label: sexOption, value: sexOption});
                        });
                        return res;
                    }
                }
            } */

        },

        render: function() {
            this.$el.html(this.template({__:i18n}));
            this.stickit();
            return this;
        }

    });

} (xtens, xtens.module("personaldetails")));
