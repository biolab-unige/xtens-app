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
        model: Group.Model
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
            
            this.datatype = new Datatype.List();
            this.datatype.fetch();
            this.operator = new Operator.List();
            this.operator.fetch();
                 if(options.id) {
                this.group = new Group.Model({id: options.id});
                this.group.fetch({
                    success:this.fetchSuccess  });
            } else {
                this.$el.html(this.template({__: i18n,group:null,datatypes:this.datatype.models,operators:this.operator.models}));
                return this;
            }},

            events: {
                'submit .edit-group-form': 'saveGroup',
                'click .delete': 'deleteGroup',
                'click .update':'updateGroup'
            },

            fetchSuccess: function (group) {
                        this.$el.html(this.template({__: i18n, group: group,datatypes:this.datatype.models,operators:this.operator.models}));
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
                var that = this;
                   var id_operatorass = $("#associationop option:selected").attr("id");
                 var id_operatordiss = $("#dissociationop option:not(:selected)").attr("id");
                   var id_group = that.group.id;
                    if (id_operatorass !== undefined) {
                 $.post( '/groupOperator/associate',
                {id_group: id_group, id_operator:id_operatorass},
                function () {
                             }
            );
        }         

       else if(id_operatordiss !== undefined)
        {
        $.post( '/groupOperator/dissociate',
                {id_group: id_group, id_operator:id_operatordiss},
                function () {
                             }
            );
         
         }
         else{
             that.group.save();
         }
                  

                    router.navigate('groups', {trigger:true});
                    window.location.reload();

                    return false;

            },
            deleteGroup: function (ev) {
                var that = this;
                var rif_id = that.group.id;
                that.group.destroy({
                    success: function () {
                        a = that.groupsDT.where({id_group:rif_id});
                        for (var i=0;i<a.length;i++)
                        {
                            a[i].destroy();
                        }
                        b = that.groupsOP.where({ id_group:rif_id});
                        for (var j=0;j<b.length;j++)
                        {
                        b[j].destroy();
                        }
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
                error: function() {
                    _this.$el.html(_this.template({__: i18n}));
                    return _this;    
                }

            });

        }
    });

} (xtens, xtens.module("group")));
