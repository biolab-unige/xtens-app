(function(xtens, GroupsDataType) {



    
    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router; 
    
    GroupsDataType.Model = Backbone.Model.extend({

        urlRoot: '/groupsDataType',

    });

    GroupsDataType.List = Backbone.Collection.extend({
        url: '/groupsDataType',
        model: GroupsDataType.Model
    });

    


} (xtens, xtens.module("groupsDataType")));
