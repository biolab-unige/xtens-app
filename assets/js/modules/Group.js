(function(xtens, Group) {



    
    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router; 
    
    Group.Model = Backbone.Model.extend({

        urlRoot: '/group',

    });

    Group.List = Backbone.Collection.extend({
        url: '/group',
        model: Group.Model
    });

    

    Group.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'group',

        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/group-edit.ejs"]; 
            this.render(options);
        },

        render: function(options)  {
            var self = this;
            if(options.id) {
                self.group = new Group.Model({id: options.id});
                self.group.fetch({
                    success: function (group) {
                        self.$el.html(self.template({__: i18n, group: group}));
                        return self;

                    }
                });
            } else {
                self.$el.html(self.template({__: i18n,group:null}));
                return self;
            }},

            events: {
                'submit .edit-group-form': 'saveGroup',
                'click .delete': 'deleteGroup',
                'click .update':'updateGroup'
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
                var that = this;
              
                that.group.set({name: document.Myform.name.value});
                that.group.save();
                
                router.navigate('groups', {trigger:true});
		window.location.reload();
		
                return false;

            },
            deleteGroup: function (ev) {
                var that = this;
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

            var self = this;
            var groups= new Group.List();
           	groups.fetch({
                success: function(groups) {
                    self.$el.html(self.template({__: i18n, groups: groups.models}));
                    return self;
                },
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                    return self;    
                }

            });

        }
    });

} (xtens, xtens.module("group")));
