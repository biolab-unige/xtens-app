(function(xtens, Association) {



    
    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router; 
    
    Association.Model = Backbone.Model.extend({

        urlRoot: '/association',

    });

    Association.List = Backbone.Collection.extend({
        url: '/association',
        model: Association.Model
    });

    


} (xtens, xtens.module("association")));
