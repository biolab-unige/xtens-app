(function(xtens, AdminAssociation) {


    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    var Group = xtens.module("group");
    var Operator = xtens.module("operator");
    var Datatype = xtens.module("datatype");

 /* AdminAssociation.Model = Backbone.Model.extend({

        urlRoot: '/association',

    });

    AdminAssociation.List = Backbone.Collection.extend({
        url: '/association',
        model: AdminAssociation.Model
    });
*/

    AdminAssociation.Views.GroupOperator = Backbone.View.extend({

        tagName: 'div',
        className: 'adminAssociation',

        initialize: function(options) {
            _.bindAll(this,'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/operator-association.ejs"]; 

            this.render(options);



        },

        render: function(options)  {
            var that = this;
            that.operator = new Operator.List();
            that.operator.fetch();
            if(options.id) {
                that.group = new Group.Model({id: options.id});
                that.group.fetch({
                    success:this.fetchSuccess  });
            } else {
                that.$el.html(that.template({__: i18n,group:null}));
                return that;
            }},

            fetchSuccess: function (group) {
                this.$el.html(this.template({__: i18n, group: group,operators:this.operator.models}));
                return this;

            },




    });

    AdminAssociation.Views.GroupDatatype = Backbone.View.extend({

        tagName: 'div',
        className: 'adminAssociation',
       
	
        initialize: function(options) {
        
             _.bindAll(this,'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-association.ejs"];
            this.render(options);
        },

        render: function(options)  {

            this.datatype = new Datatype.List();
            this.datatype.fetch();
            if(options.id) {
                this.group = new Group.Model({id: options.id});
                this.group.fetch({
                    success:this.fetchSuccess  });
            } else {
                this.$el.html(this.template({__: i18n,group:null}));
                return this;
            }
        },

        fetchSuccess: function (group) {
            this.$el.html(this.template({__: i18n, group: group,datatypes:this.datatype.models}));
            return this;

        },
 
	


    });


} (xtens, xtens.module("adminassociation")));
