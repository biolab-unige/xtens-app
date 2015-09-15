/**
 * @author  Massimiliano Izzo
 * @description This file contains the Backbone classes for handling DataType
 *              models, collections and views  
 */
(function(xtens, DataFile) {

    var i18n = xtens.module("i18n").en;
    
    /**
     * @class 
     * @name DataFile.Model
     *
     */
    DataFile.Model = Backbone.Model.extend({
        
        urlRoot: '/dataFile'

    });
    
    /**
     * @class
     * @name DataFile.List
     */
    DataFile.List = Backbone.Collection.extend({
    
        url: '/dataFile'

    });
    
    /**
     * @class
     * @name DataFile.Views.List
     */
    DataFile.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'dataFile',

        events: {
            'click .remove-me': 'closeMe'
        },
        
        initialize: function() {
            this.template = JST["views/templates/datafile-list.ejs"];
        },

        render: function() {
            this.$el.html(this.template({__:i18n, dataFiles: this.collection.models}));
            return this;
        },
        
        /**
         * @method
         * @name closeMe
         * @description trigger a 'closeMe' for the parent view to get it and close this child
         */
        closeMe: function(ev) {
            this.trigger("closeMe", this);
        }

    });

} (xtens, xtens.module("datafile")));
