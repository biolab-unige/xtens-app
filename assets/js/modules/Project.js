(function(xtens, Project) {
   
    Project.Model = Backbone.Model.extend({
        urlRoot: '/project'
    });
    
    Project.List = Backbone.Collection.extend({
        url: '/project'
    });

} (xtens, xtens.module("project")));
