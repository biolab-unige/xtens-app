/**
 * @author Massimiliano Izzo
 */


(function(xtens) {

    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;

    /**
     * @method
     * @name handleError
     *
     */
    function handleError(res){
        var modal, body;

        var error = res.responseJSON.error._internal ? res.responseJSON.error._internal : res.responseJSON.error;

        if (_.isObject(error)){
          //error is an object
            var details = res.responseJSON.error.message.details;
            if (_.isArray(details)){
              //error.message is object and has details
                var path = details[0].path.split(".");
                body = path[0] + " " + path[1].toUpperCase() + " " + details[0].message;
            }
            else{
              //error.message is a string
                body = error.message;
            }
        }
        else {
          //error is a string
            var splitted = error && error.split(":");
            body = splitted && splitted[1];
            if(res.responseJSON.error.raw){
                var err = res.responseJSON.error.raw;
                body = "Error on column <b>" + err.column + "</b> in  <b>" + err.table + "</b>";
            }
        }

        var title = (error && error.name) || res.statusMessage || 'Error';
        !body ? body = 'Error - Generic' : null;
        modal = new ModalDialog({
            title: title,
            body: body,
            type: "delete"
        });

        $("#main").append(modal.render().el);
        $('.modal-header').addClass('alert-danger');
        modal.show();

        $('#main .xtens-modal').on('hidden.bs.modal', function (e) {

            modal.remove();
            if (res.status === (403 || 401)) {
                window.location.replace('/#homepage');
            }
        });

    }

    xtens.error = handleError;
} (xtens));

/**
 * @description function to overrid the original Backbone sync method to supply authentication Token
 */
(function(Backbone) {

    var originalSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.headers = options.headers || {};
        var accessToken = xtens.session.get('accessToken');
        if (accessToken) {
            _.extend(options.headers, { 'Authorization': 'Bearer ' + accessToken });
        }
        return originalSync.call(model, method, model, options);
    };

})(Backbone);


/**
 * Provides a full extention for a Backbone Model
 * Mutuated from: https://coderwall.com/p/xj81ua
 */

(function(Model){
    'use strict';
    // Additional extension layer for Models
    //

    Model.fullExtend = function (protoProps, staticProps) {
        // Call default extend method
        var extended = Model.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended.prototype._super = this.prototype;
        // Apply new or different defaults on top of the original
        if (protoProps.defaults) {
            for (var k in this.prototype.defaults) {
                if (!extended.prototype.defaults[k]) {
                    extended.prototype.defaults[k] = this.prototype.defaults[k];
                }
            }
        }
        return extended;
    };

})(Backbone.Model);

/**
 * Provides a full extention for a Backbone View
 * mutuated from: https://coderwall.com/p/xj81ua
 */

(function(View){
    'use strict';
    // Additional extension layer for Views
    View.fullExtend = function (protoProps, staticProps) {
        // Call default extend method
        var extended = View.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended.prototype._super = this.prototype;
        // Apply new or different events on top of the original
        if (protoProps.events) {
            for (var k in this.prototype.events) {
                if (!extended.prototype.events[k]) {
                    extended.prototype.events[k] = this.prototype.events[k];
                }
            }
        }
        return extended;
    };

})(Backbone.View);


(function($) {

    /**
     *  Ajax prefilters are useful for hooking into all AJAX request
     */

    /*  $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
        options.url = 'http://localhost:1337' + options.url;
        });  */

    /**
     *  @method
     *  @description jQuery serializeObject plugin
     */

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

    /**
     * Method to prevent undesired key-related events (ENTER, ...)
     */
    $("html").on('keypress', function(ev) {
        if (ev.keyCode === 13) { // The ENTER keycode is 13
            return false;
        }
    });

})(jQuery);
