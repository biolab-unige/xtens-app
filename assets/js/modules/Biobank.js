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
            var personalContactView = new ContactInformation.Views.Edit({
                model: new ContactInformation.Model(this.model.get("contactInformation"))
            });
            this.$("contact-information-cnt").append(personalContactView.render().el);
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
            this.$el.html(this.template({__: i18n}));
            this.stickit();
            return this;
        },

        saveBiobank: function() {
            this.model.save(null, {
                success: function(biobank) {
                    router.navigate('biobanks', {trigger: true});
                },
                error: xtens.error
            });
        }
    
    });

    Biobank.Views.List = Backbone.View.extend({
        // TODO
    });

} (xtens, xtens.module("biobank")));
