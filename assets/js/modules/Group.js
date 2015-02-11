(function(xtens, Group) {




    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    var Datatype = xtens.module("datatype");
    var Operator = xtens.module("operator");
   
    Group.Model = Backbone.Model.extend({

        urlRoot: '/group',
	
	

    });

    Group.List = Backbone.Collection.extend({
        url: '/group',
        model: Group.Model,
	
    });



    Group.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'group',

        initialize: function(options) {
             _.bindAll(this,'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/group-edit.ejs"]; 
            this.render(options);
                   },

     render: function(options)  {
            
           
                 if(options.id) {
                this.group = new Group.Model({id: options.id});
                this.group.fetch({
                    success:this.fetchSuccess, error:function(group,res){xtens.error(res);}  });
            } else {
		
                this.$el.html(this.template({__: i18n,group:null}));
                return this;
            }},

            events: {
                'submit .edit-group-form': 'saveGroup',
                'click .delete': 'deleteGroup',
                'click .update':'updateGroup'
            },

            fetchSuccess: function (group) {
                        this.$el.html(this.template({__: i18n, group: group}));
                        return this;

                    },


            saveGroup: function(ev) {

                var groupDetails = $(ev.currentTarget).serializeObject();
                groupDetails = {name: groupDetails.name};
                var group = new Group.Model();

                group.save(groupDetails, {
                    patch:true,	
                    success: function(group) {
                        router.navigate('groups', {trigger: true});
                    },
                    error: function() {
                        console.log("Error saving the Group");
                    }
                });
                return false;
            },
            updateGroup: function(ev) {
              this.group.set({name:document.Myform.name.value});
             this.group.save();
        
                  

                    router.navigate('groups', {trigger:true});
                    window.location.reload();

                    return false;

            },
            deleteGroup: function (ev) {
                var that = this;
                var rif_id = that.group.id;
                that.group.destroy({
                    success: function () {
                        console.log('destroyed');
                        router.navigate('groups', {trigger:true});
                    }
                });
                return false;
            }
    });

    Group.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'group',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/group-list.ejs"];
            this.render();
        },

        render: function(options) {

            var _this = this;
            var groups= new Group.List();
            groups.fetch({
                success: function(groups) {
                    _this.$el.html(_this.template({__: i18n, groups: groups.models}));
                    return _this;
                },
                error: 	function(groups,res){xtens.error(res)},
		/*function() {

                    // _this.$el.html(_this.template({__: i18n}));
                   // return _this;    
                }*/

            });

        }
    });

} (xtens, xtens.module("group")));
