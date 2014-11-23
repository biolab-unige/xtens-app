(function(xtens, utils) {

    utils.replaceUnderscoreAndCapitalize = function(str) {
        return str.replace("_", " ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

} (xtens, xtens.module("utils")));
