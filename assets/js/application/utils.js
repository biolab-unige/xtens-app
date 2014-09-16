/**
 * Provides a full extention for a Backbone Model
 * Mutuated from: https://coderwall.com/p/xj81ua
 */

(function(Model){
    'use strict';
    // Additional extension layer for Models
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

    $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
        options.url = 'http://localhost:1337' + options.url;
    });    

    /*
     *  jQuery serializeObject plugin
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

