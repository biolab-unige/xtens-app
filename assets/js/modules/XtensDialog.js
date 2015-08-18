/**
 * @author Massimiliano Izzo
 *
 */
(function(xtens, XtensDialog) {

    var i18n = xtens.module("i18n").en;

    /**
     * @class
     * @description A class to implement a modal dialog based on Bootstrap Library
     */
    XtensDialog.Views.ModalDialog = Backbone.View.extend({
        
        className: 'xtens-modal',

        events: {
            'hidden.bs.modal div.modal': 'removeMe'
        },

        initialize: function(options) {
            this.template = JST['views/templates/dialog-bootstrap.ejs'];
            this.title = options.title;
            this.body = options.body;
        },

        render: function() {
            this.$el.html(this.template({ __: i18n }));
            this.$modal = this.$("div.modal");
            if (this.title) {
                this.$(".modal-title").html(this.title);
            }
            if (this.body) {
                this.$(".modal-body").html(this.body);
            }
            return this;
        },

        show: function() {
            this.$modal.modal();
        },

        removeMe: function() {
            console.log("removing XtensDialog");
            this.remove();
        }

    });

} (xtens, xtens.module("xtensdialog")));
