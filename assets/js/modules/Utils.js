(function(xtens, utils) {
    
    /**
     * @description convert a string replacing underscore with whitespaces and Capitalizing only the first letter 
     */
    utils.replaceUnderscoreAndCapitalize = function(str) {
        return str.replace(/_/g, " ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
    
    /**
     * @description a set of utility functions for Date management
     */
    utils.date = {
        
        /**
         * @description convert European Date Format string ("MM/DD/YYYY") to the corresponding Date
         * @return {Date} the corresponding date
         */   
        eurostring2IsoDate: function(val) {
            var dateArray = val.split("/");
            return new Date(dateArray[2] + '-'+ dateArray[1] + '-' + dateArray[0]);
        },

        zuluDatetime2eurostring: function(val) {
            return val.slice(0, val.indexOf("T")).split("-").reverse().join("/");
        }



    };

} (xtens, xtens.module("utils")));
