(function(xtens, GroupsOperator) {



    
    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router; 
    
    GroupsOperator.Model = Backbone.Model.extend({

        urlRoot: '/groupsOperator',

    });

    GroupsOperator.List = Backbone.Collection.extend({
        url: '/groupsOperator',
        model: GroupsOperator.Model
    });

    


} (xtens, xtens.module("groupsOperator")));
