/**
 * @author  Massimiliano Izzo
 * @description This file contains the Backbone classes for handling Biobank
 *              models, collections and views according to the MIABIS standard
 */
(function(xtens, Biobank) {
    // dependencies
    var i18n = xtens.module("i18n").en;
    var ContactInformation = xtens.module("contactinformation");

    // XTENS router alias
    var router = xtens.router;

    var parsleyOpts = {
        priorityEnabled: false,
        // excluded: "select[name='fieldUnit']",
        successClass: "has-success",
        errorClass: "has-error",
        classHandler: function(el) {
            return el.$element.parent();
        },
        errorsWrapper: "<span class='help-block'></span>",
        errorTemplate: "<span></span>"
    };

    Biobank.Model = Backbone.Model.extend({
        urlRoot: '/biobank'
    });

    Biobank.List = Backbone.Collection.extend({
        url: '/biobank',
        model: Biobank.Model
    });
    
    Biobank.Views.Edit = Backbone.View.extend({
        
        tagName: 'div',
        className: 'biobank',

        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/biobank-edit.ejs"];
            this.render();
            this.personalContactView = new ContactInformation.Views.Edit({
                model: new ContactInformation.Model(this.model.get("contactInformation"))
            });
            this.$("#contact-information-cnt").append(this.personalContactView.render().el);
            this.$("form").parsley(parsleyOpts);
        },

        bindings: {
            '#biobankID': 'biobankID',
            '#acronym': 'acronym',
            '#name': 'name',
            '#url': 'url',
            '#juristicPerson':'juristicPerson',
            '#country': 'country',
            '#description': 'description'
        },

        render: function() {
            this.$el.html(this.template({__: i18n, biobank: this.model}));
            this.stickit();
            return this;
        },
        
        events: {
            'submit #biobank-form': 'saveBiobank'
        },

        saveBiobank: function() {
            var contactInformation = _.clone(this.personalContactView.model.attributes);
            this.model.save({
                contactInformation: contactInformation,
            }, {
                success: function(biobank) {
                    router.navigate('biobanks', {trigger: true});
                },
                error: xtens.error
            });
            return false;
        }
    
    });

    Biobank.Views.List = Backbone.View.extend({
        tagName: 'div',
        className: 'biobanks',

         initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/biobank-list.ejs"];
            this.render();
        },

        render: function(options) {
            var that = this;
            var biobanks = new Biobank.List();
            biobanks.fetch({
                success: function(biobanks) {
                    that.$el.html(that.template({__: i18n, biobanks: biobanks.models}));
                },
                error: function() {
                    that.$el.html(that.template({__: i18n}));
                }
            });
            return this;
        }
    });

} (xtens, xtens.module("biobank")));
